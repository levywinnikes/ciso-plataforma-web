import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { apiError, requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const result = await requireSession();
  if ("error" in result) return result.error;

  const { user } = result;

  if (!user.organizationId) {
    return apiError("errors.forbidden", 403);
  }

  const userIdToDelete = params.id;

  if (user.id === userIdToDelete) {
    return apiError("errors.cannotDeleteSelf", 400);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userIdToDelete },
  });

  if (!targetUser || targetUser.organizationId !== user.organizationId) {
    return apiError("errors.userNotFound", 404);
  }

  await prisma.user.delete({
    where: { id: userIdToDelete },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const result = await requireSession();
  if ("error" in result) return result.error;

  const { user } = result;

  if (!user.organizationId) {
    return apiError("errors.forbidden", 403);
  }

  const userIdToUpdate = params.id;
  const body = await request.json();

  const targetUser = await prisma.user.findUnique({
    where: { id: userIdToUpdate },
  });

  if (!targetUser || targetUser.organizationId !== user.organizationId) {
    return apiError("errors.userNotFound", 404);
  }

  if (body.email && body.email !== targetUser.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (existingEmail) {
      return apiError("errors.emailAlreadyExists", 400);
    }
  }

  const dataToUpdate: any = {};
  if (body.name) dataToUpdate.name = body.name.trim();
  if (body.email) dataToUpdate.email = body.email.trim().toLowerCase();
  if (typeof body.isAdmin === "boolean") dataToUpdate.isAdmin = body.isAdmin;

  if (body.password && body.password.length >= 8) {
    dataToUpdate.passwordHash = await hash(body.password, 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userIdToUpdate },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updatedUser);
}
