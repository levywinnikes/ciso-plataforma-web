import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getSessionUser(session: unknown) {
  return (session as { user?: { role?: string } } | null)?.user;
}

function isAdmin(session: unknown) {
  return getSessionUser(session)?.role === "ADMINISTRATIVO";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const accesses = await prisma.professionalAccess.findMany({
    include: {
      professionalGroup: { select: { id: true, name: true } },
      clinic: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    accesses.map((item) => ({
      id: item.id,
      professionalGroupId: item.professionalGroupId,
      professionalGroupName: item.professionalGroup.name,
      clinicId: item.clinicId,
      clinicName: item.clinic.name,
      createdAt: item.createdAt,
    })),
  );
}

interface CreateAccessBody {
  professionalGroupId?: string;
  clinicId?: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = (await request.json()) as CreateAccessBody;
  if (!body.professionalGroupId || !body.clinicId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [group, clinic] = await Promise.all([
    prisma.organization.findUnique({ where: { id: body.professionalGroupId } }),
    prisma.organization.findUnique({ where: { id: body.clinicId } }),
  ]);

  if (!group || group.type !== "PROFISSIONAL_GROUP") {
    return NextResponse.json(
      { error: "Grupo profissional inválido" },
      { status: 400 },
    );
  }

  if (!clinic || clinic.type !== "CLINICA") {
    return NextResponse.json({ error: "Clínica inválida" }, { status: 400 });
  }

  const created = await prisma.professionalAccess.create({
    data: {
      professionalGroupId: body.professionalGroupId,
      clinicId: body.clinicId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
