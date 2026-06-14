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

interface UpdateOrganizationBody {
  name?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  agreementIds?: string[];
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = (await request.json()) as UpdateOrganizationBody;

  const updated = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: context.params.id },
      data: {
        name: body.name?.trim(),
        cnpj: body.cnpj !== undefined ? body.cnpj?.trim() || null : undefined,
        address:
          body.address !== undefined ? body.address?.trim() || null : undefined,
        phone:
          body.phone !== undefined ? body.phone?.trim() || null : undefined,
      },
    });

    if (body.agreementIds !== undefined) {
      await tx.organizationAgreement.deleteMany({
        where: { clinicId: context.params.id },
      });

      if (body.agreementIds.length > 0) {
        await tx.organizationAgreement.createMany({
          data: body.agreementIds.map((agreementId) => ({
            clinicId: context.params.id,
            agreementId,
          })),
        });
      }
    }

    return org;
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.organization.delete({ where: { id: context.params.id } });
  return new NextResponse(null, { status: 204 });
}
