import type { ReferralStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  PROFESSIONAL_EDITABLE_STATUSES,
  validateBlockedStatusInput,
} from "@/features/referrals/block-status";
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const referralId = params.id;

  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
  });

  if (!referral) {
    return NextResponse.json(
      { message: "Encaminhamento não encontrado" },
      { status: 404 },
    );
  }

  const isCreator = referral.createdByUserId === session.user.id;
  const isSameOrg =
    session.user.organizationId &&
    referral.officeId === session.user.organizationId;
  const isAdmin = session.user.role === "ADMINISTRATIVO";

  if (!isCreator && !isSameOrg && !isAdmin) {
    return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
  }

  if (!PROFESSIONAL_EDITABLE_STATUSES.includes(referral.status) && !isAdmin) {
    return NextResponse.json(
      {
        message:
          "Apenas encaminhamentos com status inicial podem ser editados.",
      },
      { status: 400 },
    );
  }

  const body = await request.json();

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

  let nextStatus: ReferralStatus = referral.status;
  let nextJustification = referral.justificativaBloqueio;

  if (isAdmin) {
    nextStatus = (body.status as ReferralStatus) || referral.status;
  } else if (body.status === "Bloqueado" || body.status === "Encaminhado") {
    nextStatus = body.status;
  }

  const statusValidation = validateBlockedStatusInput({
    status: nextStatus,
    justificativaBloqueio:
      body.justificativaBloqueio !== undefined
        ? body.justificativaBloqueio
        : referral.justificativaBloqueio,
    previousStatus: referral.status,
  });

  if (!statusValidation.ok) {
    return NextResponse.json(
      { message: statusValidation.message },
      { status: 400 },
    );
  }

  nextJustification =
    nextStatus === "Bloqueado"
      ? statusValidation.justificativaBloqueio
      : (statusValidation.justificativaBloqueio ??
        referral.justificativaBloqueio);

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

  const updatedReferral = await prisma.$transaction(async (tx) => {
    if (Array.isArray(body.documents)) {
      await tx.referralDocument.deleteMany({
        where: { referralId },
      });
      await tx.referralDocument.createMany({
        data: body.documents.map(
          (item: { name?: string; url?: string; key?: string }) => ({
            referralId,
            fileName: item.name || "documento",
            url: item.url || item.key || null,
          }),
        ),
      });
    }

    const updated = await tx.referral.update({
      where: { id: referralId },
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
        agreementId: body.agreementId || null,
        status: nextStatus,
        justificativaBloqueio: nextJustification,
        ...(isAdmin && {
          appointmentDate: body.appointmentDate
            ? new Date(body.appointmentDate)
            : null,
          doctor: body.doctor || null,
          surgeryId: body.surgeryId || null,
          surgeryPrice:
            body.surgeryPrice !== undefined && body.surgeryPrice !== null
              ? Number(body.surgeryPrice)
              : null,
          specialistNotes: body.specialistNotes || null,
          specialistConduct: body.specialistConduct || null,
        }),
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

    if (nextStatus !== referral.status) {
      await tx.referralStatusAudit.create({
        data: {
          referralId,
          fromStatus: referral.status,
          toStatus: nextStatus,
          justificativaBloqueio:
            nextStatus === "Bloqueado" || referral.status === "Bloqueado"
              ? nextJustification
              : null,
          userId: session.user.id,
        },
      });
    }

    return updated;
  });

  return NextResponse.json(await mapReferralResponse(updatedReferral));
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const referralId = params.id;

  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
  });

  if (!referral) {
    return NextResponse.json(
      { message: "Encaminhamento não encontrado" },
      { status: 404 },
    );
  }

  const isCreator = referral.createdByUserId === session.user.id;
  const isSameOrg =
    session.user.organizationId &&
    referral.officeId === session.user.organizationId;
  const isAdmin = session.user.role === "ADMINISTRATIVO";

  if (!isCreator && !isSameOrg && !isAdmin) {
    return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
  }

  if (referral.status === "Atendido") {
    return NextResponse.json(
      { message: "Encaminhamentos concluídos não podem ser excluídos." },
      { status: 400 },
    );
  }

  if (!PROFESSIONAL_EDITABLE_STATUSES.includes(referral.status) && !isAdmin) {
    return NextResponse.json(
      {
        message:
          "Apenas encaminhamentos com status inicial podem ser excluídos.",
      },
      { status: 400 },
    );
  }

  await prisma.referral.delete({
    where: { id: referralId },
  });

  return NextResponse.json({ message: "Encaminhamento excluído com sucesso." });
}
