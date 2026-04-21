import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("123456", 12);

  const users = [
    {
      id: "USR-1",
      name: "Levy Administrativo",
      email: "admin@ciso.com.br",
      role: "ADMINISTRATIVO" as const,
      passwordHash,
    },
    {
      id: "USR-2",
      name: "Bianca Triagem",
      email: "clinica@ciso.com.br",
      role: "CLINICA" as const,
      passwordHash,
    },
    {
      id: "USR-3",
      name: "Dr. Fernando Silva",
      email: "medico@ciso.com.br",
      role: "MEDICO" as const,
      passwordHash,
    },
    {
      id: "USR-4",
      name: "Camila Profissional",
      email: "profissional@ciso.com.br",
      role: "PROFISSIONAL" as const,
      passwordHash,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash: user.passwordHash },
      create: user,
    });
    console.log(`✅ User upserted: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
