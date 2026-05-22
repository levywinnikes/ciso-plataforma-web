import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";

import { canAccessPath, resolveRolePath } from "@/features/auth/service";
import type { UserRole } from "@/features/auth/types";

import { routing } from "./i18n";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/api/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return intlMiddleware(req);
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as UserRole | undefined;

  // Token sem role e considerado invalido: pode ser um JWT antigo emitido
  // antes do callback jwt popular o campo, ou um usuario com role nula no
  // banco. Em qualquer caso, forcamos relogin para evitar acesso indevido.
  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    const response = NextResponse.redirect(loginUrl);
    // Limpa o cookie de sessao para que o NextAuth emita um novo token no proximo login.
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(resolveRolePath(role), req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
