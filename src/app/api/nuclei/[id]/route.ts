import { NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface UpdateNucleusBody {
  name?: string;
  description?: string;
  chargedPrice?: number;
  serviceIds?: string[];
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
  const serviceIds = body.serviceIds;

  if (
    !name ||
    !description ||
    !Number.isFinite(chargedPrice) ||
    chargedPrice <= 0
  ) {
    return apiError("errors.invalidNucleusData", 400);
  }

  let sanitizedServiceIds: string[] | undefined;
  if (serviceIds) {
    if (!Array.isArray(serviceIds)) {
      return apiError("errors.invalidServiceData", 400);
    }
    if (serviceIds.length === 0) {
      return apiError("errors.atLeastOneService", 400);
    }
    sanitizedServiceIds = serviceIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0,
    );

    if (sanitizedServiceIds.length !== serviceIds.length) {
      return apiError("errors.invalidServiceData", 400);
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (sanitizedServiceIds) {
      await tx.careNucleusService.deleteMany({
        where: { nucleusId: context.params.id },
      });
    }

    return await tx.careNucleus.update({
      where: { id: context.params.id },
      data: {
        name,
        description,
        chargedPrice,
        ...(sanitizedServiceIds && {
          services: {
            create: sanitizedServiceIds.map((id) => ({ serviceId: id })),
          },
        }),
      },
      include: {
        services: {
          include: { service: true },
        },
      },
    });
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    chargedPrice: Number(updated.chargedPrice),
    services: updated.services.map((junction) => ({
      id: junction.service.id,
      name: junction.service.name,
      basePrice: Number(junction.service.basePrice),
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
