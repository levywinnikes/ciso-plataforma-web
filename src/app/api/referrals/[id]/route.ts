import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseBirthDate(value: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

function mapReferral(referral: {
  id: string;
  patientName: string;
  patientBirthDate: Date;
  patientPhone: string;
  patientDocument: string | null;
  systemicDiseases: string | null;
  clinicalNotes: string | null;
  clinicalSuspicion: string | null;
  status: "Encaminhado" | "Agendado" | "Atendido";
  doctor: string | null;
  appointmentDate: Date | null;
  specialistNotes: string | null;
  specialistConduct: string | null;
  createdAt: Date;
  nucleusId: string;
  nucleusSnapshotName: string;
  nucleusSnapshotPrice: any;
  clinicId: string;
  clinic: { name: string };
  officeId: string;
  office: { name: string };
  createdByUserId: string;
  createdByUser: { name: string; email: string };
  nucleus: { name: string };
  documents: Array<{ id: string; fileName: string; createdAt: Date }>;
  specialistFiles: Array<{ id: string; fileName: string; createdAt: Date }>;
  agreementId: string | null;
  agreement: { name: string } | null;
  surgeryId?: string | null;
  surgery?: { name: string } | null;
  surgeryPrice?: any;
}) {
  return {
    id: referral.id,
    patientName: referral.patientName,
    patientBirthDate: referral.patientBirthDate.toISOString().slice(0, 10),
    patientPhone: referral.patientPhone,
    patientDocument: referral.patientDocument ?? undefined,
    systemicDiseases: referral.systemicDiseases ?? undefined,
    clinicalNotes: referral.clinicalNotes ?? undefined,
    clinicalSuspicion: referral.clinicalSuspicion ?? undefined,
    createdAt: referral.createdAt.toISOString().slice(0, 10),
    status: referral.status,
    nucleusId: referral.nucleusId,
    nucleusName: referral.nucleusSnapshotName,
    nucleusPrice: Number(referral.nucleusSnapshotPrice),
    nucleusSnapshotServices: (referral as any).nucleusSnapshotServices as
      | Array<{ name: string; basePrice: number }>
      | undefined,
    clinicId: referral.clinicId,
    clinicName: referral.clinic.name,
    officeId: referral.officeId,
    officeName: referral.office.name,
    agreementId: referral.agreementId ?? undefined,
    agreementName: referral.agreement?.name ?? undefined,
    surgeryId: referral.surgeryId ?? undefined,
    surgeryName: referral.surgery?.name ?? undefined,
    surgeryPrice: referral.surgeryPrice
      ? Number(referral.surgeryPrice)
      : undefined,
    createdByUserId: referral.createdByUserId,
    createdByUserName: referral.createdByUser.name,
    appointmentDate: referral.appointmentDate?.toISOString() ?? undefined,
    doctor: referral.doctor ?? undefined,
    specialistNotes: referral.specialistNotes ?? undefined,
    specialistConduct: referral.specialistConduct ?? undefined,
    documents: referral.documents.map((item) => ({
      id: item.id,
      name: item.fileName,
      uploadedAt: item.createdAt.toISOString(),
    })),
    specialistAttachments: referral.specialistFiles.map((item) => ({
      id: item.id,
      name: item.fileName,
      uploadedAt: item.createdAt.toISOString(),
    })),
  };
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

  // Regra de Negócio: Só pode editar se o status for "Encaminhado"
  if (referral.status !== "Encaminhado" && !isAdmin) {
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

  const updatedReferral = await prisma.referral.update({
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

  return NextResponse.json(mapReferral(updatedReferral));
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

  // Verifica se quem está tentando deletar pertence ao escritório (Consultório) ou é o próprio criador
  // ou é o administrador do sistema
  const isCreator = referral.createdByUserId === session.user.id;
  const isSameOrg =
    session.user.organizationId &&
    referral.officeId === session.user.organizationId;
  const isAdmin = session.user.role === "ADMINISTRATIVO";

  if (!isCreator && !isSameOrg && !isAdmin) {
    return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
  }

  // Regra de Negócio: Só pode excluir se o status for "Encaminhado"
  if (referral.status !== "Encaminhado" && !isAdmin) {
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
