import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { apiError, canManageUser, getSessionUser } from "@/lib/api-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateUserBody {
  name?: string;
  password?: string;
  isAdmin?: boolean;
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!(await canManageUser(getSessionUser(session), context.params.id))) {
    return apiError("errors.forbidden", 403);
  }

  const body = (await request.json()) as UpdateUserBody;
  const data: {
    name?: string;
    passwordHash?: string;
    isAdmin?: boolean;
  } = {};

  if (body.name?.trim()) data.name = body.name.trim();
  if (typeof body.isAdmin === "boolean") data.isAdmin = body.isAdmin;
  if (body.password) {
    if (body.password.length < 8) {
      return apiError("errors.passwordTooShort", 400);
    }
    data.passwordHash = await hash(body.password, 12);
  }

  const updated = await prisma.user.update({
    where: { id: context.params.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      organizationId: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!(await canManageUser(getSessionUser(session), context.params.id))) {
    return apiError("errors.forbidden", 403);
  }

  await prisma.user.delete({ where: { id: context.params.id } });
  return new NextResponse(null, { status: 204 });
}
