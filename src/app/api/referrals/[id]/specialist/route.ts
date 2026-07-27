import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveDocumentUrl } from "@/lib/storage";

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
      { message: "Apenas médicos da clínica podem concluir referrals" },
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

  const updated = await prisma.$transaction(async (tx) => {
    if (body.files) {
      await tx.referralAttachment.deleteMany({
        where: { referralId: params.id },
      });
    }

    return await tx.referral.update({
      where: { id: params.id },
      data: {
        specialistNotes: body.notes || null,
        specialistConduct: body.conduct || null,
        surgeryId: body.surgeryId || null,
        surgeryPrice:
          body.surgeryPrice !== undefined && body.surgeryPrice !== null
            ? body.surgeryPrice
            : null,
        ...(body.files && {
          specialistFiles: {
            create: body.files.map(
              (item: { name?: string; url?: string; key?: string }) => ({
                fileName: item.name || "arquivo",
                url: item.url || item.key || null,
              }),
            ),
          },
        }),
        status: body.complete ? "Atendido" : undefined,
      },
      include: {
        specialistFiles: true,
        surgery: { select: { name: true } },
      },
    });
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
