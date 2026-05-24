import { NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

interface UpdateNucleusBody {
  name?: string;
  description?: string;
  chargedPrice?: number;
  services?: Array<{
    name?: string;
    basePrice?: number;
  }>;
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
  const services = body.services;

  if (
    !name ||
    !description ||
    !Number.isFinite(chargedPrice) ||
    chargedPrice <= 0
  ) {
    return apiError("errors.invalidNucleusData", 400);
  }

  let sanitizedServices: Array<{ name: string; basePrice: number }> | undefined;
  if (services) {
    if (!Array.isArray(services)) {
      return apiError("errors.invalidServiceData", 400);
    }
    if (services.length === 0) {
      return apiError("errors.atLeastOneService", 400);
    }
    sanitizedServices = services
      .map((service) => ({
        name: service.name?.trim() || "",
        basePrice: Number(service.basePrice),
      }))
      .filter(
        (service) =>
          service.name.length > 0 &&
          Number.isFinite(service.basePrice) &&
          service.basePrice > 0,
      );

    if (sanitizedServices.length !== services.length) {
      return apiError("errors.invalidServiceData", 400);
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (sanitizedServices) {
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
        ...(sanitizedServices && {
          services: {
            create: sanitizedServices,
          },
        }),
      },
      include: { services: true },
    });
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
