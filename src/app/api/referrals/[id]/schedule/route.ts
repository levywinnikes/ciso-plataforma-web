import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const scheduleSchema = z.object({
  clinicId: z.string().min(1),
  doctorUserId: z.string().min(1),
  appointmentDate: z.string().min(1),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  if (auth.user.role !== "ADMINISTRATIVO") {
    return apiError("errors.forbidden", 403);
  }

  const body = await request.json();
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("errors.invalidScheduleData", 400);
  }

  const referral = await prisma.referral.findUnique({
    where: { id: params.id },
  });

  if (!referral) {
    return apiError("errors.referralNotFound", 404);
  }

  if (referral.status !== "Encaminhado") {
    return apiError("errors.invalidScheduleData", 400);
  }

  const clinic = await prisma.organization.findUnique({
    where: { id: parsed.data.clinicId },
    select: { id: true, type: true },
  });

  if (!clinic || clinic.type !== "CLINICA") {
    return apiError("errors.organizationNotFound", 404);
  }

  const doctor = await prisma.user.findFirst({
    where: {
      id: parsed.data.doctorUserId,
      organizationId: parsed.data.clinicId,
      role: "MEDICO",
    },
    select: { id: true, name: true },
  });

  if (!doctor) {
    return apiError("errors.invalidUserData", 400);
  }

  const updated = await prisma.referral.update({
    where: { id: params.id },
    data: {
      clinicId: parsed.data.clinicId,
      doctor: doctor.name,
      appointmentDate: new Date(parsed.data.appointmentDate),
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
