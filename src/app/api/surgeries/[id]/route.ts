import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMINISTRATIVO") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  const { name, defaultPrice, active } = (await request.json()) as {
    name?: string;
    defaultPrice?: number;
    active?: boolean;
  };

  try {
    if (name && name.trim()) {
      const existing = await prisma.surgery.findUnique({
        where: { name: name.trim() },
      });

      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: "errors.surgeryAlreadyExists" },
          { status: 400 },
        );
      }
    }

    const surgery = await prisma.surgery.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(defaultPrice !== undefined && { defaultPrice }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({
      ...surgery,
      defaultPrice: Number(surgery.defaultPrice),
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro ao atualizar cirurgia" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMINISTRATIVO") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  try {
    await prisma.surgery.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro ao excluir cirurgia" },
      { status: 500 },
    );
  }
}
