import { NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface UpdateNucleusBody {
  name?: string;
  description?: string;
  chargedPrice?: number;
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as UpdateNucleusBody;

  const name = body.name?.trim();
  const description = body.description?.trim();
  const chargedPrice = Number(body.chargedPrice);

  if (
    !name ||
    !description ||
    !Number.isFinite(chargedPrice) ||
    chargedPrice <= 0
  ) {
    return apiError("errors.invalidNucleusData", 400);
  }

  const updated = await prisma.careNucleus.update({
    where: { id: context.params.id },
    data: {
      name,
      description,
      chargedPrice,
    },
    include: { services: true },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    chargedPrice: Number(updated.chargedPrice),
    services: updated.services.map((service) => ({
      id: service.id,
      name: service.name,
      basePrice: Number(service.basePrice),
    })),
  });
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  await prisma.careNucleus.delete({ where: { id: context.params.id } });
  return new NextResponse(null, { status: 204 });
}
