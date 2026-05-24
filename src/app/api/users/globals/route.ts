import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireAdministrativo();
  if ("error" in result) return result.error;

  const users = await prisma.user.findMany({
    where: { role: "ADMINISTRATIVO" },
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
}

export async function POST(request: Request) {
  const result = await requireAdministrativo();
  if ("error" in result) return result.error;

  const body = (await request.json()) as CreateUserBody;

  if (!body.name?.trim()) {
    return apiError("errors.nameRequired", 400);
  }

  if (!body.email?.trim() || !body.email.includes("@")) {
    return apiError("errors.invalidEmail", 400);
  }

  if (!body.password || body.password.length < 8) {
    return apiError("errors.passwordTooShort", 400);
  }

  const normalizedEmail = body.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return apiError("errors.emailAlreadyExists", 400);
  }

  const passwordHash = await hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "ADMINISTRATIVO",
      isAdmin: false, // Gestor Global não usa flag de admin local
      organizationId: null,
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
