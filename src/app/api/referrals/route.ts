import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { mapReferralResponse } from "@/features/referrals/map-referral";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseBirthDate(value: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { role, organizationId, id, isAdmin } = session.user;
  let where = {};

  if (role === "MEDICO") {
    if (!organizationId) {
      return NextResponse.json(
        { message: "Usuário médico sem organização vinculada" },
        { status: 403 },
      );
    }

    where = {
      clinicId: organizationId,
      status: {
        in: ["Agendado", "Atendido"],
      },
    };
  }

  if (role === "PROFISSIONAL") {
    if (!organizationId) {
      return NextResponse.json(
        { message: "Usuário profissional sem organização vinculada" },
        { status: 403 },
      );
    }

    where = isAdmin
      ? { createdByUser: { organizationId } }
      : { createdByUserId: id };
  }

  const referrals = await prisma.referral.findMany({
    where,
    include: {
      nucleus: { select: { name: true } },
      clinic: { select: { name: true } },
      office: { select: { name: true } },
      createdByUser: { select: { name: true, email: true } },
      documents: true,
      specialistFiles: true,
      agreement: { select: { name: true } },
      surgery: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    await Promise.all(referrals.map((item) => mapReferralResponse(item))),
  );
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

  const referral = await prisma.referral.create({
    data: {
      patientName: body.patientName,
      patientBirthDate: parseBirthDate(body.patientBirthDate),
      patientPhone: String(body.patientPhone).replace(/\D/g, ""),
      patientDocument: body.patientDocument || null,
      systemicDiseases: body.systemicDiseases || null,
      clinicalNotes: body.clinicalNotes || null,
      clinicalSuspicion: body.clinicalSuspicion || null,
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
    include: {
      nucleus: { select: { name: true } },
      clinic: { select: { name: true } },
      office: { select: { name: true } },
      createdByUser: { select: { name: true, email: true } },
      documents: true,
      specialistFiles: true,
      agreement: { select: { name: true } },
      surgery: { select: { name: true } },
    },
  });

  return NextResponse.json(await mapReferralResponse(referral), {
    status: 201,
  });
}
