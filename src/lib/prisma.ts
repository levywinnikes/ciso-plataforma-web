import "@/env";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function isTransientDbError(error: unknown): boolean {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    code === "P1017" ||
    code === "P1001" ||
    code === "P1008" ||
    /57P01|administrator command|terminating connection|Can't reach database|closed the connection/i.test(
      message,
    )
  );
}

export async function withPrismaRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isTransientDbError(error)) {
      throw error;
    }
    await prisma.$disconnect().catch(() => undefined);
    await prisma.$connect();
    return run();
  }
}
