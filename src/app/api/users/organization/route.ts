import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { apiError, requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireSession();
  if ("error" in result) return result.error;

  const { user } = result;

  if (!user.organizationId) {
    return apiError("errors.forbidden", 403);
  }

  const users = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
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
  isAdmin?: boolean;
}

export async function POST(request: Request) {
  const result = await requireSession();
  if ("error" in result) return result.error;

  const { user } = result;

  if (!user.organizationId) {
    return apiError("errors.forbidden", 403);
  }

  // Apenas admins locais (isAdmin = true) ou o dono/gestor podem criar usuários,
  // mas como o usuário pediu "por enquanto todo usuário vai ter os mesmos poderes",
  // vamos permitir que qualquer um da organização crie outro.

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

  // Regra definida: Consultório -> PROFISSIONAL, Clínica -> MEDICO
  // Como saber o tipo? O current user tem a role correta.
  // Se quem cria é PROFISSIONAL, o novo é PROFISSIONAL.
  // Se quem cria é MEDICO, o novo é MEDICO.
  const role = user.role === "PROFISSIONAL" ? "PROFISSIONAL" : "MEDICO";

  const newUser = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role,
      isAdmin: Boolean(body.isAdmin),
      organizationId: user.organizationId,
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

  return NextResponse.json(newUser, { status: 201 });
}
