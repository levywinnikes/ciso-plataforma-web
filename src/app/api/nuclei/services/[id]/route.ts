import { NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface ServicePayload {
  name?: string;
  basePrice?: number;
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const id = context.params.id;
  const body = (await request.json()) as ServicePayload;

  const name = body.name?.trim();
  const basePrice = Number(body.basePrice);

  if (!name || !Number.isFinite(basePrice) || basePrice <= 0) {
    return apiError("errors.invalidServiceData", 400);
  }

  const updated = await prisma.careNucleusService.update({
    where: { id },
    data: {
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

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    basePrice: Number(updated.basePrice),
    nucleusId: updated.nucleus.id,
    nucleusName: updated.nucleus.name,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const id = context.params.id;

  await prisma.careNucleusService.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
