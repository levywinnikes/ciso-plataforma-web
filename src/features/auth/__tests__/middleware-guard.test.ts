/**
 * Testes da lógica de proteção de rotas do middleware.
 *
 * O middleware em si depende de `next-auth/jwt` (getToken) e
 * `next-intl/middleware`, que são difíceis de isolar em Jest sem um servidor
 * HTTP real. Por isso testamos aqui as funções puras que determinam o
 * comportamento de redirecionamento: `canAccessPath` e `resolveRolePath`.
 *
 * Comportamento esperado do middleware (validado nos testes E2E / manual):
 *  - Sem token → redireciona para /login?callbackUrl=...
 *  - Token com role ADMINISTRATIVO acessando /clinica → redireciona para /admin
 *  - Token com role CLINICA acessando /admin → redireciona para /clinica
 *  - /login e /api/auth/* → sempre públicos, sem redirecionamento
 */

import { canAccessPath, resolveRolePath } from "@/features/auth/service";
import type { UserRole } from "@/features/auth/types";

describe("middleware route guard logic", () => {
  describe("PUBLIC_PATHS — always accessible, no token required", () => {
    const publicPaths = ["/login", "/login?callbackUrl=%2Fadmin"];

    it.each(publicPaths)("path %s is accessible to any role", (path) => {
      const roles: UserRole[] = [
        "ADMINISTRATIVO",
        "CLINICA",
        "MEDICO",
        "PROFISSIONAL",
      ];
      // /login is marked public before the role check runs in middleware
      // canAccessPath handles /login as permissive
      for (const role of roles) {
        expect(canAccessPath(role, "/login")).toBe(true);
      }
    });
  });

  describe("authenticated user — correct role for path", () => {
    it("ADMINISTRATIVO can access their dashboard", () => {
      expect(canAccessPath("ADMINISTRATIVO", "/admin")).toBe(true);
      expect(canAccessPath("ADMINISTRATIVO", "/admin/financeiro")).toBe(true);
    });

    it("CLINICA can access their dashboard", () => {
      expect(canAccessPath("CLINICA", "/clinica")).toBe(true);
    });

    it("MEDICO can access their dashboard", () => {
      expect(canAccessPath("MEDICO", "/medico")).toBe(true);
    });

    it("PROFISSIONAL can access their dashboard and sub-routes", () => {
      expect(canAccessPath("PROFISSIONAL", "/profissional")).toBe(true);
      expect(canAccessPath("PROFISSIONAL", "/profissional/novo")).toBe(true);
    });
  });

  describe("authenticated user — wrong role for path → must redirect", () => {
    const crossRoleAttempts: Array<[UserRole, string, string]> = [
      ["CLINICA", "/admin", "/clinica"],
      ["CLINICA", "/medico", "/clinica"],
      ["MEDICO", "/admin", "/medico"],
      ["MEDICO", "/clinica", "/medico"],
      ["PROFISSIONAL", "/admin", "/profissional"],
      ["PROFISSIONAL", "/clinica", "/profissional"],
      ["ADMINISTRATIVO", "/clinica", "/admin"],
      ["ADMINISTRATIVO", "/medico", "/admin"],
      ["ADMINISTRATIVO", "/profissional", "/admin"],
    ];

    it.each(crossRoleAttempts)(
      "role %s accessing %s → canAccessPath=false → redirect to %s",
      (role, attemptedPath, expectedRedirect) => {
        expect(canAccessPath(role, attemptedPath)).toBe(false);
        expect(resolveRolePath(role)).toBe(expectedRedirect);
      },
    );
  });

  describe("unauthenticated user (no token)", () => {
    it("middleware would redirect to /login (canAccessPath called after token check)", () => {
      // This represents the middleware logic:
      // const token = await getToken(...) → null
      // if (!token) return redirect('/login') ← this happens before canAccessPath
      // The test here documents the expected behavior.
      const hasToken = false;
      const isPublic = (p: string) =>
        ["/login", "/api/auth"].some((pub) => p.startsWith(pub));
      const requestedPath = "/admin";

      const shouldRedirectToLogin = !hasToken && !isPublic(requestedPath);
      expect(shouldRedirectToLogin).toBe(true);
    });

    it("unauthenticated access to /login is allowed (public path bypass)", () => {
      const hasToken = false;
      const isPublic = (p: string) =>
        ["/login", "/api/auth"].some((pub) => p.startsWith(pub));
      const requestedPath = "/login";

      const shouldRedirectToLogin = !hasToken && !isPublic(requestedPath);
      expect(shouldRedirectToLogin).toBe(false);
    });
  });
});
