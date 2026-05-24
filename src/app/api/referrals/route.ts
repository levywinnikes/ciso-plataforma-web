import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

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
  organizationId: string;
  organization: { name: string };
  createdByUserId: string;
  createdByUser: { name: string; email: string };
  nucleus: { name: string };
  documents: Array<{ id: string; fileName: string; createdAt: Date }>;
  specialistFiles: Array<{ id: string; fileName: string; createdAt: Date }>;
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
    nucleusName: referral.nucleus.name,
    organizationId: referral.organizationId,
    organizationName: referral.organization.name,
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

    where = { organizationId };
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
      organization: { select: { name: true } },
      createdByUser: { select: { name: true, email: true } },
      documents: true,
      specialistFiles: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(referrals.map(mapReferral));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  if (session.user.role !== "PROFISSIONAL") {
    return NextResponse.json(
      { message: "Apenas profissionais podem criar referrals" },
      { status: 403 },
    );
  }

  if (!session.user.organizationId) {
    return NextResponse.json(
      { message: "Usuário profissional sem organização vinculada" },
      { status: 403 },
    );
  }

  const body = await request.json();

  if (
    !body.patientName ||
    !body.patientBirthDate ||
    !body.patientPhone ||
    !body.nucleusId ||
    !body.organizationId
  ) {
    return NextResponse.json(
      { message: "Dados obrigatórios ausentes" },
      { status: 400 },
    );
  }

  // FIXME: validação de ProfessionalAccess removida temporariamente.
  // Será reativada quando o painel de Acessos for recriado.

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
      organizationId: body.organizationId,
      createdByUserId: session.user.id,
      documents: {
        create:
          body.documents?.map((item: { name?: string }) => ({
            fileName: item.name || "documento",
          })) ?? [],
      },
    },
    include: {
      nucleus: { select: { name: true } },
      organization: { select: { name: true } },
      createdByUser: { select: { name: true, email: true } },
      documents: true,
      specialistFiles: true,
    },
  });

  return NextResponse.json(mapReferral(referral), { status: 201 });
}
