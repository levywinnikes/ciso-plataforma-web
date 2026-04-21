import type { AuthUser, LoginPayload, UserRole } from "./types";

interface StoredUser extends AuthUser {
  password: string;
}

const MOCK_USERS: StoredUser[] = [
  {
    id: "USR-1",
    name: "Levy Administrativo",
    email: "admin@ciso.com.br",
    password: "123456",
    role: "ADMINISTRATIVO",
  },
  {
    id: "USR-2",
    name: "Bianca Triagem",
    email: "clinica@ciso.com.br",
    password: "123456",
    role: "CLINICA",
  },
  {
    id: "USR-3",
    name: "Dr. Fernando Silva",
    email: "medico@ciso.com.br",
    password: "123456",
    role: "MEDICO",
  },
  {
    id: "USR-4",
    name: "Camila Profissional",
    email: "profissional@ciso.com.br",
    password: "123456",
    role: "PROFISSIONAL",
  },
];

export function authenticate(payload: LoginPayload): AuthUser | null {
  const user = MOCK_USERS.find(
    (item) =>
      item.email.toLowerCase() === payload.email.trim().toLowerCase() &&
      item.password === payload.password,
  );

  if (!user) {
    return null;
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function resolveRolePath(role: UserRole): string {
  switch (role) {
    case "ADMINISTRATIVO":
      return "/admin";
    case "CLINICA":
      return "/clinica";
    case "MEDICO":
      return "/medico";
    case "PROFISSIONAL":
      return "/profissional";
    default:
      return "/login";
  }
}
