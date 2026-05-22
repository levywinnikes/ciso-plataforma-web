import type { UserRole } from "./types";

const rolePathMap: Record<UserRole, string> = {
  ADMINISTRATIVO: "/admin",
  MEDICO: "/medico",
  PROFISSIONAL: "/profissional",
};

export function resolveRolePath(role: UserRole): string {
  return rolePathMap[role] ?? "/login";
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const normalizedPath = pathname.toLowerCase();

  if (normalizedPath === "/" || normalizedPath === "/login") {
    return true;
  }

  const roleHomePath = resolveRolePath(role);
  return normalizedPath.startsWith(roleHomePath);
}
