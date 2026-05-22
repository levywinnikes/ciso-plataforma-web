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

interface UpdateOrganizationBody {
  name?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = (await request.json()) as UpdateOrganizationBody;

  const updated = await prisma.organization.update({
    where: { id: context.params.id },
    data: {
      name: body.name?.trim(),
      cnpj: body.cnpj?.trim() || null,
      address: body.address?.trim() || null,
      phone: body.phone?.trim() || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.organization.delete({ where: { id: context.params.id } });
  return new NextResponse(null, { status: 204 });
}
