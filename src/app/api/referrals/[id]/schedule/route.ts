import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json();

  if (!body.doctor || !body.appointmentDate) {
    return NextResponse.json(
      { message: "Dados obrigatórios ausentes" },
      { status: 400 },
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
