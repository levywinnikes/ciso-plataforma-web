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
      { message: "Apenas médicos da clínica podem concluir referrals" },
      { status: 403 },
    );
  }

  const body = await request.json();

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
