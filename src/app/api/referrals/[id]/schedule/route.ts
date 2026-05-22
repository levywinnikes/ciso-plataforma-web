import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  if (session.user.role !== "MEDICO" || !session.user.organizationId) {
    return NextResponse.json(
      { message: "Apenas médicos da clínica podem agendar referrals" },
      { status: 403 },
    );
  }

  const body = await request.json();

  if (!body.doctor || !body.appointmentDate) {
    return NextResponse.json(
      { message: "Dados obrigatórios ausentes" },
      { status: 400 },
    );
  }

  const referral = await prisma.referral.findFirst({
    where: {
      id: params.id,
      organizationId: session.user.organizationId,
    },
  });

  if (!referral) {
    return NextResponse.json(
      { message: "Referral não encontrado para esta clínica" },
      { status: 404 },
    );
  }

  const updated = await prisma.referral.update({
    where: { id: params.id },
    data: {
      doctor: body.doctor,
      appointmentDate: new Date(body.appointmentDate),
      status: "Agendado",
    },
  });

  return NextResponse.json({
    id: updated.id,
    doctor: updated.doctor,
    appointmentDate: updated.appointmentDate?.toISOString(),
    status: updated.status,
  });
}
