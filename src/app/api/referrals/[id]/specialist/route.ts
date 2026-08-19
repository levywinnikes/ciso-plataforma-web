import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { resolveDocumentUrl } from "@/lib/storage";

const specialistSchema = z.object({
  notes: z.string().optional().nullable(),
  conduct: z.string().optional().nullable(),
  surgeryId: z.string().optional().nullable(),
  surgeryPrice: z.union([z.number(), z.null()]).optional(),
  complete: z.boolean().optional(),
  files: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.string().optional(),
        key: z.string().optional(),
      }),
    )
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  if (!auth.user.id) {
    return apiError("errors.unauthorized", 401);
  }
  const userId = auth.user.id;

  if (auth.user.role !== "MEDICO" || !auth.user.organizationId) {
    return apiError("errors.forbidden", 403);
  }

  const body = await request.json();
  const parsed = specialistSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("errors.invalidSpecialistData", 400);
  }

  const referral = await prisma.referral.findFirst({
    where: {
      id: params.id,
      clinicId: auth.user.organizationId,
    },
  });

  if (!referral) {
    return apiError("errors.referralNotFound", 404);
  }

  const shouldComplete = Boolean(parsed.data.complete);
  const nextStatus = shouldComplete ? "Atendido" : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    if (parsed.data.files) {
      await tx.referralAttachment.deleteMany({
        where: { referralId: params.id },
      });
    }

    const next = await tx.referral.update({
      where: { id: params.id },
      data: {
        specialistNotes: parsed.data.notes || null,
        specialistConduct: parsed.data.conduct || null,
        surgeryId: parsed.data.surgeryId || null,
        surgeryPrice:
          parsed.data.surgeryPrice !== undefined &&
          parsed.data.surgeryPrice !== null
            ? parsed.data.surgeryPrice
            : null,
        ...(parsed.data.files && {
          specialistFiles: {
            create: parsed.data.files.map((item) => ({
              fileName: item.name || "arquivo",
              url: item.url || item.key || null,
            })),
          },
        }),
        status: nextStatus,
      },
      include: {
        specialistFiles: true,
        surgery: { select: { name: true } },
      },
    });

    if (shouldComplete && referral.status !== "Atendido") {
      await tx.referralStatusAudit.create({
        data: {
          referralId: referral.id,
          fromStatus: referral.status,
          toStatus: "Atendido",
          userId,
        },
      });
    }

    return next;
  });

  const specialistAttachments = await Promise.all(
    updated.specialistFiles.map(async (item) => ({
      id: item.id,
      name: item.fileName,
      key: item.url ?? undefined,
      url: await resolveDocumentUrl(item.url),
      uploadedAt: item.createdAt.toISOString(),
    })),
  );

  return NextResponse.json({
    id: updated.id,
    specialistNotes: updated.specialistNotes,
    specialistConduct: updated.specialistConduct,
    specialistAttachments,
    status: updated.status,
    surgeryId: updated.surgeryId,
    surgeryName: updated.surgery?.name,
    surgeryPrice: updated.surgeryPrice
      ? Number(updated.surgeryPrice)
      : undefined,
  });
}
