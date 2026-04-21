import { NextResponse } from "next/server";

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
  status: "Encaminhado" | "Agendado" | "Atendido";
  doctor: string | null;
  appointmentDate: Date | null;
  specialistNotes: string | null;
  specialistConduct: string | null;
  createdAt: Date;
  nucleusId: string;
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
    createdAt: referral.createdAt.toISOString().slice(0, 10),
    status: referral.status,
    nucleusId: referral.nucleusId,
    nucleusName: referral.nucleus.name,
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
  const referrals = await prisma.referral.findMany({
    include: {
      nucleus: { select: { name: true } },
      documents: true,
      specialistFiles: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(referrals.map(mapReferral));
}

export async function POST(request: Request) {
  const body = await request.json();

  if (
    !body.patientName ||
    !body.patientBirthDate ||
    !body.patientPhone ||
    !body.nucleusId
  ) {
    return NextResponse.json(
      { message: "Dados obrigatórios ausentes" },
      { status: 400 },
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
      nucleusId: body.nucleusId,
      documents: {
        create:
          body.documents?.map((item: { name?: string }) => ({
            fileName: item.name || "documento",
          })) ?? [],
      },
    },
    include: {
      nucleus: { select: { name: true } },
      documents: true,
      specialistFiles: true,
    },
  });

  return NextResponse.json(mapReferral(referral), { status: 201 });
}
