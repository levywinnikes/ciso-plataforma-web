export type UserRole = "ADMINISTRATIVO" | "MEDICO" | "PROFISSIONAL";
export type OrganizationType = "CLINICA" | "PROFISSIONAL_GROUP";

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  organizationType: OrganizationType | null;
  isAdmin: boolean;
}

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  organizationId: string | null;
  organizationType: OrganizationType | null;
  isAdmin: boolean;
}
