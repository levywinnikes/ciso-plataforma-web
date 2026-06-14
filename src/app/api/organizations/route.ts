import { OrganizationType, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const organizations = await prisma.organization.findMany({
    where:
      type === "CLINICA" || type === "PROFISSIONAL_GROUP"
        ? { type: type as OrganizationType }
        : undefined,
    include: {
      _count: {
        select: {
          users: true,
          referrals: true,
        },
      },
      agreements: {
        select: {
          agreementId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(organizations);
}

interface CreateOrganizationBody {
  name?: string;
  type?: OrganizationType;
  cnpj?: string;
  address?: string;
  phone?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  agreementIds?: string[];
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = (await request.json()) as CreateOrganizationBody;
  const name = body.name?.trim();
  const type = body.type;
  const adminName = body.adminName?.trim();
  const adminEmail = body.adminEmail?.trim().toLowerCase();
  const adminPassword = body.adminPassword;

  if (!name || !type || (type !== "CLINICA" && type !== "PROFISSIONAL_GROUP")) {
    return NextResponse.json(
      { error: "Dados de organização inválidos" },
      { status: 400 },
    );
  }

  if (!adminName || !adminEmail || !adminPassword || adminPassword.length < 8) {
    return NextResponse.json(
      { error: "Dados de admin local inválidos" },
      { status: 400 },
    );
  }

  const passwordHash = await hash(adminPassword, 12);
  const userRole: UserRole = type === "CLINICA" ? "MEDICO" : "PROFISSIONAL";

  const created = await prisma.organization.create({
    data: {
      name,
      type,
      cnpj: body.cnpj?.trim() || null,
      address: body.address?.trim() || null,
      phone: body.phone?.trim() || null,
      users: {
        create: {
          name: adminName,
          email: adminEmail,
          role: userRole,
          isAdmin: true,
          passwordHash,
        },
      },
      agreements:
        body.agreementIds && type === "CLINICA"
          ? {
              create: body.agreementIds.map((agreementId) => ({
                agreementId,
              })),
            }
          : undefined,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isAdmin: true,
        },
      },
      _count: {
        select: {
          users: true,
          referrals: true,
        },
      },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
