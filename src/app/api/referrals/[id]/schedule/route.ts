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

  // Apenas quem loga como clínica (MEDICO/ADMINISTRATIVO associado a clínica) pode agendar
  if (!session.user.organizationId) {
    return NextResponse.json(
      { message: "Apenas clínicas podem agendar atendimentos" },
      { status: 403 },
    );
  }

  const body = await request.json();

  const referral = await prisma.referral.findFirst({
    where: {
      id: params.id,
      clinicId: session.user.organizationId,
    },
  });

  if (!referral) {
    return NextResponse.json(
      { message: "Referral não encontrado para esta clínica" },
      { status: 404 },
    );
  }

  if (referral.status !== "Encaminhado") {
    return NextResponse.json(
      { message: "Somente encaminhamentos pendentes podem ser agendados" },
      { status: 400 },
    );
  }

  const updated = await prisma.referral.update({
    where: { id: params.id },
    data: {
      doctor: body.doctor || null,
      appointmentDate: body.appointmentDate
        ? new Date(body.appointmentDate)
        : null,
      status: "Agendado",
    },
  });

  return NextResponse.json({
    id: updated.id,
    doctor: updated.doctor,
    appointmentDate: updated.appointmentDate,
    status: updated.status,
  });
}
