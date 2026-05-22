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

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.professionalAccess.delete({ where: { id: context.params.id } });
  return new NextResponse(null, { status: 204 });
}
