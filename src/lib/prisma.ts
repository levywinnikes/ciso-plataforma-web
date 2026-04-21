import "@/env";

type PrismaClientLike = {
  [key: string]: unknown;
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientLike | undefined;
}

export function getPrismaClient(): PrismaClientLike {
  if (global.prisma) {
    return global.prisma;
  }

  // Lazy require keeps compilation stable even before prisma generate is executed.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({
    log: ["warn", "error"],
  }) as PrismaClientLike;

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }

  return prisma;
}
