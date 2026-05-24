import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const referralId = params.id;

  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
  });

  if (!referral) {
    return NextResponse.json(
      { message: "Encaminhamento não encontrado" },
      { status: 404 },
    );
  }

  // Verifica se quem está tentando deletar pertence ao escritório (Consultório) ou é o próprio criador
  // ou é o administrador do sistema
  const isCreator = referral.createdByUserId === session.user.id;
  const isSameOrg =
    session.user.organizationId &&
    referral.officeId === session.user.organizationId;
  const isAdmin = session.user.role === "ADMINISTRATIVO";

  if (!isCreator && !isSameOrg && !isAdmin) {
    return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
  }

  // Regra de Negócio: Só pode excluir se o status for "Encaminhado"
  if (referral.status !== "Encaminhado" && !isAdmin) {
    return NextResponse.json(
      {
        message:
          "Apenas encaminhamentos com status inicial podem ser excluídos.",
      },
      { status: 400 },
    );
  }

  await prisma.referral.delete({
    where: { id: referralId },
  });

  return NextResponse.json({ message: "Encaminhamento excluído com sucesso." });
}
