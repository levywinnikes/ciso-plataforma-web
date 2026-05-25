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

  const { name, basePrice } = (await request.json()) as {
    name?: string;
    basePrice?: number;
  };

  try {
    const service = await prisma.careService.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(basePrice !== undefined && { basePrice }),
      },
    });

    return NextResponse.json(service);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "errors.serviceAlreadyExists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Erro ao atualizar serviço" },
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
    await prisma.careService.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Erro ao excluir serviço" },
      { status: 500 },
    );
  }
}
