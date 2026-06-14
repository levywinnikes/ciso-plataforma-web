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

  const { name, active } = (await request.json()) as {
    name?: string;
    active?: boolean;
  };

  try {
    if (name && name.trim()) {
      const existing = await prisma.agreement.findUnique({
        where: { name: name.trim() },
      });

      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: "errors.agreementNameUnique" },
          { status: 400 },
        );
      }
    }

    const agreement = await prisma.agreement.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(agreement);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro ao atualizar convênio" },
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
    await prisma.agreement.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Erro ao excluir convênio" },
      { status: 500 },
    );
  }
}
