import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMINISTRATIVO") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  const services = await prisma.careService.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMINISTRATIVO") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  const { name, basePrice } = (await request.json()) as {
    name: string;
    basePrice: number;
  };

  if (!name || basePrice === undefined) {
    return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
  }

  try {
    const service = await prisma.careService.create({
      data: {
        name: name.trim(),
        basePrice,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "errors.serviceAlreadyExists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Erro ao criar serviço" },
      { status: 500 },
    );
  }
}
