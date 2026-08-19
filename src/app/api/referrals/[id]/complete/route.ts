import { NextResponse } from "next/server";
import { z } from "zod";

import { canAdminMarkAsAttended } from "@/features/referrals/overdue";
import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const idSchema = z.object({
  id: z.string().min(1, { message: "errors.referralNotFound" }),
});

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;
  if (!auth.user.id) {
    return apiError("errors.unauthorized", 401);
  }

  const parsedParams = idSchema.safeParse(params);
  if (!parsedParams.success) {
    return apiError("errors.referralNotFound", 404);
  }

  const referral = await prisma.referral.findUnique({
    where: { id: parsedParams.data.id },
  });

  if (!referral) {
    return apiError("errors.referralNotFound", 404);
  }

  if (referral.status === "Atendido") {
    return apiError("errors.referralAlreadyCompleted", 400);
  }

  if (referral.status === "Bloqueado") {
    return apiError("errors.referralBlockedCannotComplete", 400);
  }

  if (!canAdminMarkAsAttended(referral.status)) {
    return apiError("errors.cannotCompleteReferral", 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.referral.update({
      where: { id: referral.id },
      data: { status: "Atendido" },
    });

    await tx.referralStatusAudit.create({
      data: {
        referralId: referral.id,
        fromStatus: referral.status,
        toStatus: "Atendido",
        userId: auth.user.id,
      },
    });

    return next;
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
  });
}
