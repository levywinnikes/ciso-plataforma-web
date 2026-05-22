import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: unknown) {
  const user = (session as { user?: { role?: string } } | null)?.user;
  return user?.role === "ADMINISTRATIVO";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const services = await prisma.careNucleusService.findMany({
    include: {
      nucleus: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(
    services.map((service) => ({
      id: service.id,
      name: service.name,
      basePrice: Number(service.basePrice),
      nucleusId: service.nucleus.id,
      nucleusName: service.nucleus.name,
    })),
  );
}

interface CreateServiceBody {
  nucleusId?: string;
  name?: string;
  basePrice?: number;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = (await request.json()) as CreateServiceBody;
  const nucleusId = body.nucleusId?.trim();
  const name = body.name?.trim();
  const basePrice = Number(body.basePrice);

  if (!nucleusId || !name || !Number.isFinite(basePrice) || basePrice <= 0) {
    return NextResponse.json(
      { error: "Dados de serviço inválidos" },
      { status: 400 },
    );
  }

  const created = await prisma.careNucleusService.create({
    data: {
      nucleusId,
      name,
      basePrice,
    },
    include: {
      nucleus: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      basePrice: Number(created.basePrice),
      nucleusId: created.nucleus.id,
      nucleusName: created.nucleus.name,
    },
    { status: 201 },
  );
}
