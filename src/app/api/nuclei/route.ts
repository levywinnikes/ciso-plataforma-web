import { NextResponse } from "next/server";

import {
  apiError,
  requireAdministrativo,
  requireSession,
} from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const nuclei = await prisma.careNucleus.findMany({
    include: {
      services: {
        include: { service: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const response = nuclei.map((nucleus) => ({
    id: nucleus.id,
    name: nucleus.name,
    description: nucleus.description,
    chargedPrice: Number(nucleus.chargedPrice),
    services: nucleus.services.map((junction) => ({
      id: junction.service.id, // using the global service ID
      name: junction.service.name,
      basePrice: Number(junction.service.basePrice),
    })),
  }));

  return NextResponse.json(response);
}

interface CreateNucleusBody {
  name?: string;
  description?: string;
  chargedPrice?: number;
  serviceIds?: string[];
}

export async function POST(request: Request) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as CreateNucleusBody;

  const name = body.name?.trim();
  const description = body.description?.trim();
  const chargedPrice = Number(body.chargedPrice);
  const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds : [];

  if (
    !name ||
    !description ||
    !Number.isFinite(chargedPrice) ||
    chargedPrice <= 0
  ) {
    return apiError("errors.invalidNucleusData", 400);
  }

  if (serviceIds.length === 0) {
    return apiError("errors.atLeastOneService", 400);
  }

  // Ensure all serviceIds are valid string ids
  const sanitizedServiceIds = serviceIds.filter(
    (id) => typeof id === "string" && id.trim().length > 0,
  );

  if (sanitizedServiceIds.length !== serviceIds.length) {
    return apiError("errors.invalidServiceData", 400);
  }

  // Create nucleus and the junction records connecting to global services
  const created = await prisma.careNucleus.create({
    data: {
      name,
      description,
      chargedPrice,
      services: {
        create: sanitizedServiceIds.map((id) => ({
          serviceId: id,
        })),
      },
    },
    include: {
      services: {
        include: { service: true },
      },
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      description: created.description,
      chargedPrice: Number(created.chargedPrice),
      services: created.services.map((junction) => ({
        id: junction.service.id,
        name: junction.service.name,
        basePrice: Number(junction.service.basePrice),
      })),
    },
    { status: 201 },
  );
}
