import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { apiError, canManageOrg, getSessionUser } from "@/lib/api-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!canManageOrg(getSessionUser(session), context.params.id)) {
    return apiError("errors.forbidden", 403);
  }

  const users = await prisma.user.findMany({
    where: { organizationId: context.params.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

interface CreateUserBody {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isAdmin?: boolean;
}

export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!canManageOrg(getSessionUser(session), context.params.id)) {
    return apiError("errors.forbidden", 403);
  }

  const org = await prisma.organization.findUnique({
    where: { id: context.params.id },
    select: { type: true },
  });

  if (!org) {
    return apiError("errors.organizationNotFound", 404);
  }

  const body = (await request.json()) as CreateUserBody;
  const role = body.role;
  const allowedRole: UserRole =
    org.type === "CLINICA" ? "MEDICO" : "PROFISSIONAL";

  if (
    !body.name?.trim() ||
    !body.email?.trim() ||
    !body.password ||
    body.password.length < 8
  ) {
    return apiError("errors.invalidUserData", 400);
  }

  if (!role || role !== allowedRole) {
    return apiError("errors.invalidRoleForOrganization", 400);
  }

  const passwordHash = await hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      passwordHash,
      role,
      isAdmin: Boolean(body.isAdmin),
      organizationId: context.params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
