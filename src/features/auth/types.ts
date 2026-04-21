export type UserRole = "ADMINISTRATIVO" | "CLINICA" | "MEDICO" | "PROFISSIONAL";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}
