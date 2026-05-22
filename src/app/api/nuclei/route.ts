import { NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const nuclei = await prisma.careNucleus.findMany({
    include: { services: true },
    orderBy: { name: "asc" },
  });

  const response = nuclei.map((nucleus) => ({
    id: nucleus.id,
    name: nucleus.name,
    description: nucleus.description,
    chargedPrice: Number(nucleus.chargedPrice),
    services: nucleus.services.map((service) => ({
      id: service.id,
      name: service.name,
      basePrice: Number(service.basePrice),
    })),
  }));

  return NextResponse.json(response);
}

interface CreateNucleusBody {
  name?: string;
  description?: string;
  chargedPrice?: number;
  services?: Array<{
    name?: string;
    basePrice?: number;
  }>;
}

export async function POST(request: Request) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as CreateNucleusBody;

  const name = body.name?.trim();
  const description = body.description?.trim();
  const chargedPrice = Number(body.chargedPrice);
  const services = Array.isArray(body.services) ? body.services : [];

  if (
    !name ||
    !description ||
    !Number.isFinite(chargedPrice) ||
    chargedPrice <= 0
  ) {
    return apiError("errors.invalidNucleusData", 400);
  }

  if (services.length === 0) {
    return apiError("errors.atLeastOneService", 400);
  }

  const sanitizedServices = services
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

  const created = await prisma.careNucleus.create({
    data: {
      name,
      description,
      chargedPrice,
      services: {
        create: sanitizedServices,
      },
    },
    include: { services: true },
  });

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      description: created.description,
      chargedPrice: Number(created.chargedPrice),
      services: created.services.map((service) => ({
        id: service.id,
        name: service.name,
        basePrice: Number(service.basePrice),
      })),
    },
    { status: 201 },
  );
}
