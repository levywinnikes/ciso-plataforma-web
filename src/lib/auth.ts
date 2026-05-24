import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import type { JWTPayload, SessionUser, UserRole } from "@/features/auth/types";
import { prisma } from "@/lib/prisma";

function isTransientDbError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Can't reach database server") ||
    message.includes("terminating connection due to administrator command") ||
    message.includes("E57P01") ||
    message.includes("P1001")
  );
}

async function findUserWithRetry(email: string) {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: { organization: true },
      });
    } catch (error) {
      if (!isTransientDbError(error) || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  return null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await findUserWithRetry(
          credentials.email.trim().toLowerCase(),
        );

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          organizationId: user.organizationId,
          organizationType: user.organization?.type || null,
          organizationName: user.organization?.name || null,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userPayload = user as any;
        token.organizationId = userPayload.organizationId || null;
        token.organizationType = userPayload.organizationType || null;
        token.organizationName = userPayload.organizationName || null;
        token.isAdmin = userPayload.isAdmin || false;
        token.id = user.id;
        token.role = userPayload.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const jwtPayload = token as unknown as JWTPayload;
        session.user = {
          ...session.user,
          id: jwtPayload.id,
          role: jwtPayload.role,
          organizationId: jwtPayload.organizationId,
          organizationType: jwtPayload.organizationType,
          organizationName: jwtPayload.organizationName,
          isAdmin: jwtPayload.isAdmin,
        } as SessionUser;
      }
      return session;
    },
  },
};
