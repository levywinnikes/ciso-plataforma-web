import type { OrganizationType, UserRole } from "@/features/auth/types";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    organizationId: string | null;
    organizationType: OrganizationType | null;
    isAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      organizationId: string | null;
      organizationType: OrganizationType | null;
      isAdmin: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
    organizationId: string | null;
    organizationType: OrganizationType | null;
    isAdmin: boolean;
  }
}
