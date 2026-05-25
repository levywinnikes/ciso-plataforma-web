import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM "CareNucleusService"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "CareNucleus"`);
  console.log("Deleted old nuclei and services.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
