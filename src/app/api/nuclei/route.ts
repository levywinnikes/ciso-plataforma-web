import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const nuclei = await prisma.careNucleus.findMany({
    include: { services: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(nuclei);
}
