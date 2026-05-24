import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // Temporary solution: return all clinics since Acessos screen is gone.
  // In the future, this should filter by ProfessionalAccess based on session.user.organizationId
  const clinics = await prisma.organization.findMany({
    where: {
      type: "CLINICA",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(clinics);
}
