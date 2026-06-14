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

  const surgeries = await prisma.surgery.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });

  const mapped = surgeries.map((s) => ({
    ...s,
    defaultPrice: Number(s.defaultPrice),
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMINISTRATIVO") {
    return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
  }

  const { name, defaultPrice, active } = (await request.json()) as {
    name: string;
    defaultPrice: number;
    active?: boolean;
  };

  if (!name || !name.trim() || defaultPrice === undefined) {
    return NextResponse.json(
      { error: "errors.surgeryFieldsRequired" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.surgery.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "errors.surgeryAlreadyExists" },
        { status: 400 },
      );
    }

    const surgery = await prisma.surgery.create({
      data: {
        name: name.trim(),
        defaultPrice,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      {
        ...surgery,
        defaultPrice: Number(surgery.defaultPrice),
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro ao criar cirurgia" },
      { status: 500 },
    );
  }
}
