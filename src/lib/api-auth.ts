import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ApiSessionUser {
  id?: string;
  role?: string;
  isAdmin?: boolean;
  organizationId?: string | null;
}

/**
 * Extrai o usuario da sessao do NextAuth de forma tipada.
 *
 * Documentacao relacionada:
 * - docs/ai/access-and-permissions.md (roles do sistema)
 */
export function getSessionUser(session: unknown): ApiSessionUser | undefined {
  return (session as { user?: ApiSessionUser } | null | undefined)?.user;
}

/**
 * Resposta JSON de erro padronizada. O `code` deve ser uma chave i18n
 * resolvida pelo frontend (ex: "errors.unauthorized").
 */
export function apiError(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

/**
 * Carrega a sessao e exige que o usuario esteja autenticado.
 * Retorna `{ session, user }` em sucesso ou `NextResponse` em falha.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  const user = getSessionUser(session);
  if (!user || !user.role) {
    return { error: apiError("errors.unauthorized", 401) } as const;
  }
  return { session, user } as const;
}

/**
 * Exige que o usuario tenha role ADMINISTRATIVO (gestor global).
 *
 * Documentacao relacionada:
 * - docs/ai/access-and-permissions.md (matriz de permissoes)
 * - docs/ai/security-checklist.md (politica obrigatoria de auth em rotas)
 */
export async function requireAdministrativo() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.user.role !== "ADMINISTRATIVO") {
    return { error: apiError("errors.forbidden", 403) } as const;
  }
  return result;
}

/**
 * Verifica se o usuario pode gerenciar uma organizacao especifica.
 * ADMINISTRATIVO pode todas; admin local apenas a propria org.
 */
export function canManageOrg(
  user: ApiSessionUser | undefined,
  organizationId: string,
): boolean {
  if (!user) return false;
  if (user.role === "ADMINISTRATIVO") return true;
  return Boolean(user.isAdmin && user.organizationId === organizationId);
}

/**
 * Verifica se o usuario pode gerenciar um usuario alvo (pela org).
 * Consulta o banco para descobrir a organizacao do alvo.
 */
export async function canManageUser(
  user: ApiSessionUser | undefined,
  targetUserId: string,
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "ADMINISTRATIVO") return true;
  if (!user.isAdmin || !user.organizationId) return false;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { organizationId: true },
  });

  return target?.organizationId === user.organizationId;
}
