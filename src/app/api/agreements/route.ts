import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";

  const agreements = await prisma.agreement.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(agreements);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMINISTRATIVO") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  const { name, active } = (await request.json()) as {
    name: string;
    active?: boolean;
  };

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "errors.agreementNameRequired" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.agreement.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "errors.agreementNameUnique" },
        { status: 400 },
      );
    }

    const agreement = await prisma.agreement.create({
      data: {
        name: name.trim(),
        active: active ?? true,
      },
    });

    return NextResponse.json(agreement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro ao criar convênio" },
      { status: 500 },
    );
  }
}
