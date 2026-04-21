import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json();

  const updated = await prisma.referral.update({
    where: { id: params.id },
    data: {
      specialistNotes: body.notes || null,
      specialistConduct: body.conduct || null,
      specialistFiles: {
        create:
          body.files?.map((item: { name?: string }) => ({
            fileName: item.name || "arquivo",
          })) ?? [],
      },
      status: "Atendido",
    },
    include: {
      specialistFiles: true,
    },
  });

  return NextResponse.json({
    id: updated.id,
    specialistNotes: updated.specialistNotes,
    specialistConduct: updated.specialistConduct,
    specialistAttachments: updated.specialistFiles.map((item) => ({
      id: item.id,
      name: item.fileName,
      uploadedAt: item.createdAt.toISOString(),
    })),
    status: updated.status,
  });
}
