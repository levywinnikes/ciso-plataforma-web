import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { parseBirthDateOrNull } from "@/features/referrals/birth-date";
import { resolveCreateStatus } from "@/features/referrals/block-status";
import {
  applyAppointmentRange,
  applyColumnFilters,
  applyStatusFilter,
  applyTabFilter,
  buildReferralOrderBy,
  emptyCounts,
  parseColumnFilters,
  parsePageParams,
  parseSortParams,
  referralListInclude,
} from "@/features/referrals/list-query";
import { mapReferralResponse } from "@/features/referrals/map-referral";
import { startOfLocalDay } from "@/features/referrals/overdue";
import { apiError } from "@/lib/api-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildRoleWhere(session: {
  user: {
    role: string;
    organizationId?: string | null;
    id: string;
    isAdmin?: boolean;
  };
}):
  | { ok: true; where: Record<string, unknown> }
  | { ok: false; response: NextResponse } {
  const { role, organizationId, id, isAdmin } = session.user;
  let where: Record<string, unknown> = {};

  if (role === "MEDICO") {
    if (!organizationId) {
      return {
        ok: false,
        response: NextResponse.json(
          { message: "Usuário médico sem organização vinculada" },
          { status: 403 },
        ),
      };
    }
    where = {
      clinicId: organizationId,
      status: { in: ["Agendado", "Atendido"] },
    };
  }

  if (role === "PROFISSIONAL") {
    if (!organizationId) {
      return {
        ok: false,
        response: NextResponse.json(
          { message: "Usuário profissional sem organização vinculada" },
          { status: 403 },
        ),
      };
    }
    where = isAdmin
      ? { createdByUser: { organizationId } }
      : { createdByUserId: id };
  }

  return { ok: true, where };
}

async function computeCounts(baseWhere: Record<string, unknown>) {
  const counts = emptyCounts();
  const now = new Date();
  const dayStart = startOfLocalDay(now);

  const [byStatus, overdue, active] = await Promise.all([
    prisma.referral.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.referral.count({
      where: {
        ...baseWhere,
        status: { not: "Atendido" },
        appointmentDate: { not: null, lt: dayStart },
      },
    }),
    prisma.referral.count({
      where: {
        ...baseWhere,
        status: { not: "Bloqueado" },
      },
    }),
  ]);

  for (const row of byStatus) {
    const n = row._count._all;
    if (row.status === "Encaminhado") counts.encaminhado = n;
    if (row.status === "Agendado") counts.agendado = n;
    if (row.status === "Atendido") counts.atendido = n;
    if (row.status === "Bloqueado") counts.bloqueado = n;
  }
  counts.overdue = overdue;
  counts.active = active;
  return counts;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roleWhere = buildRoleWhere(session);
  if (!roleWhere.ok) return roleWhere.response;

  const appointmentFrom = searchParams.get("appointmentFrom");
  const appointmentTo = searchParams.get("appointmentTo");
  const tab = searchParams.get("tab");
  const status = searchParams.get("status");
  const includeCounts = searchParams.get("includeCounts") === "1";
  const { page, pageSize } = parsePageParams(searchParams);

  let where = applyAppointmentRange(
    roleWhere.where,
    appointmentFrom,
    appointmentTo,
  );
  where = applyTabFilter(where, tab);
  where = applyStatusFilter(where, status);
  where = applyColumnFilters(where, parseColumnFilters(searchParams));

  const include = referralListInclude();
  const { sortBy, sortDir } = parseSortParams(searchParams);
  const orderBy = buildReferralOrderBy(sortBy, sortDir);

  if (page === null) {
    const referrals = await prisma.referral.findMany({
      where,
      include,
      orderBy,
    });
    return NextResponse.json(
      await Promise.all(referrals.map((item) => mapReferralResponse(item))),
    );
  }

  const skip = (page - 1) * pageSize;
  const [total, referrals, counts] = await Promise.all([
    prisma.referral.count({ where }),
    prisma.referral.findMany({
      where,
      include,
      orderBy,
      skip,
      take: pageSize,
    }),
    includeCounts ? computeCounts(roleWhere.where) : Promise.resolve(undefined),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = await Promise.all(
    referrals.map((item) => mapReferralResponse(item)),
  );

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    totalPages,
    ...(counts ? { counts } : {}),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  if (
    session.user.role !== "PROFISSIONAL" &&
    session.user.role !== "ADMINISTRATIVO"
  ) {
    return NextResponse.json(
      { message: "Apenas profissionais ou administrativos podem criar" },
      { status: 403 },
    );
  }

  const body = await request.json();

  const officeId =
    session.user.role === "ADMINISTRATIVO"
      ? body.officeId
      : session.user.organizationId;
  const createdByUserId =
    session.user.role === "ADMINISTRATIVO"
      ? body.createdByUserId
      : session.user.id;

  if (!officeId || !createdByUserId) {
    return NextResponse.json(
      {
        message: "Dados de identificação do consultório/profissional ausentes",
      },
      { status: 400 },
    );
  }

  if (session.user.role === "ADMINISTRATIVO") {
    const targetUser = await prisma.user.findUnique({
      where: { id: createdByUserId },
    });

    if (
      !targetUser ||
      targetUser.role !== "PROFISSIONAL" ||
      targetUser.organizationId !== officeId
    ) {
      return NextResponse.json(
        {
          message:
            "O profissional selecionado é inválido ou não pertence ao consultório selecionado",
        },
        { status: 400 },
      );
    }
  }

  if (
    !body.patientName ||
    !body.patientBirthDate ||
    !body.patientPhone ||
    !body.nucleusId ||
    !body.clinicId
  ) {
    return NextResponse.json(
      { message: "Dados obrigatórios ausentes" },
      { status: 400 },
    );
  }

  const patientBirthDate = parseBirthDateOrNull(String(body.patientBirthDate));
  if (!patientBirthDate) {
    return apiError("errors.birthDateInvalid", 400);
  }

  const statusResult = resolveCreateStatus({
    status: body.status,
    justificativaBloqueio: body.justificativaBloqueio,
  });

  if (!statusResult.ok) {
    return NextResponse.json(
      { message: statusResult.message },
      { status: 400 },
    );
  }

  const nucleus = await prisma.careNucleus.findUnique({
    where: { id: body.nucleusId },
    include: { services: { include: { service: true } } },
  });

  if (!nucleus) {
    return NextResponse.json(
      { message: "Núcleo de atendimento não encontrado" },
      { status: 404 },
    );
  }

  const referral = await prisma.$transaction(async (tx) => {
    const created = await tx.referral.create({
      data: {
        patientName: body.patientName,
        patientBirthDate,
        patientPhone: String(body.patientPhone).replace(/\D/g, ""),
        patientDocument: body.patientDocument || null,
        systemicDiseases: body.systemicDiseases || null,
        clinicalNotes: body.clinicalNotes || null,
        clinicalSuspicion: body.clinicalSuspicion || null,
        status: statusResult.status,
        justificativaBloqueio: statusResult.justificativaBloqueio,
        nucleusId: body.nucleusId,
        nucleusSnapshotName: nucleus.name,
        nucleusSnapshotPrice: nucleus.chargedPrice,
        nucleusSnapshotServices: nucleus.services.map((junction) => ({
          name: junction.service.name,
          basePrice: junction.service.basePrice.toNumber
            ? junction.service.basePrice.toNumber()
            : Number(junction.service.basePrice),
        })),
        clinicId: body.clinicId,
        officeId,
        createdByUserId,
        agreementId: body.agreementId || null,
        documents: {
          create:
            body.documents?.map(
              (item: { name?: string; url?: string; key?: string }) => ({
                fileName: item.name || "documento",
                url: item.url || item.key || null,
              }),
            ) ?? [],
        },
      },
      include: referralListInclude(),
    });

    if (statusResult.status === "Bloqueado") {
      await tx.referralStatusAudit.create({
        data: {
          referralId: created.id,
          fromStatus: null,
          toStatus: "Bloqueado",
          justificativaBloqueio: statusResult.justificativaBloqueio,
          userId: session.user.id,
        },
      });
    }

    return created;
  });

  return NextResponse.json(await mapReferralResponse(referral), {
    status: 201,
  });
}
