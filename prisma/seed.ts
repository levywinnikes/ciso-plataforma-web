import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const CARE_NUCLEI = [
  {
    id: "consulta-simples",
    name: "Consulta Simples",
    description: "Consulta oftalmologica sem pacote adicional de exames.",
    chargedPrice: 250,
    services: [
      { id: "svc-consulta", name: "Consulta especialista", basePrice: 250 },
    ],
  },
  {
    id: "glaucoma",
    name: "Nucleo de Atendimento - Glaucoma",
    description: "Avaliacao completa para suspeita clinica de glaucoma.",
    chargedPrice: 650,
    services: [
      { id: "svc-consulta-gla", name: "Consulta especialista", basePrice: 250 },
      { id: "svc-tonometria", name: "Tonometria de aplanacao", basePrice: 70 },
      { id: "svc-gonioscopia", name: "Gonioscopia", basePrice: 130 },
      { id: "svc-galilei", name: "Galilei", basePrice: 300 },
      { id: "svc-oct-papila", name: "OCT papila", basePrice: 315 },
    ],
  },
  {
    id: "catarata",
    name: "Nucleo de Atendimento - Catarata",
    description: "Protocolo pre-operatorio com exames para catarata.",
    chargedPrice: 850,
    services: [
      { id: "svc-consulta-cat", name: "Consulta especialista", basePrice: 250 },
      { id: "svc-biometria", name: "Biometria ARGUS", basePrice: 235 },
      { id: "svc-galilei-cat", name: "Galilei", basePrice: 300 },
      { id: "svc-micro", name: "Microscopia especular", basePrice: 230 },
      { id: "svc-oct", name: "OCT", basePrice: 315 },
      { id: "svc-retina-map", name: "Mapeamento de retina", basePrice: 180 },
    ],
  },
  {
    id: "cirurgia-refrativa",
    name: "Nucleo de Atendimento - Cirurgia Refrativa",
    description:
      "Avaliacao para indicacao e elegibilidade de cirurgia refrativa.",
    chargedPrice: 550,
    services: [
      { id: "svc-consulta-ref", name: "Consulta especialista", basePrice: 250 },
      { id: "svc-olho-seco", name: "Avaliacao de olho seco", basePrice: 110 },
      { id: "svc-micro-ref", name: "Microscopia especular", basePrice: 230 },
      { id: "svc-galilei-ref", name: "Galilei", basePrice: 300 },
      {
        id: "svc-retina-map-ref",
        name: "Mapeamento de retina",
        basePrice: 180,
      },
    ],
  },
];

async function main() {
  const passwordHash = await hash("123456", 12);

  // Seed CareNuclei
  for (const nucleus of CARE_NUCLEI) {
    const { services, ...nucleusData } = nucleus;
    await prisma.careNucleus.upsert({
      where: { id: nucleusData.id },
      update: {
        name: nucleusData.name,
        description: nucleusData.description,
        chargedPrice: nucleusData.chargedPrice,
      },
      create: nucleusData,
    });
    for (const svc of services) {
      await prisma.careNucleusService.upsert({
        where: { id: svc.id },
        update: { name: svc.name, basePrice: svc.basePrice },
        create: { ...svc, nucleusId: nucleusData.id },
      });
    }
    console.log(`✅ Nucleus upserted: ${nucleusData.name}`);
  }

  // Seed Organizations
  const clinica = await prisma.organization.upsert({
    where: { id: "ORG-CLINICA-1" },
    update: {},
    create: {
      id: "ORG-CLINICA-1",
      name: "Clínica Padrão",
      type: "CLINICA",
      cnpj: "12.345.678/0001-90",
      address: "Rua das Flores, 123 - São Paulo, SP",
      phone: "+55 11 3000-0000",
    },
  });
  console.log(`✅ Organization created: ${clinica.name}`);

  const professionalGroup = await prisma.organization.upsert({
    where: { id: "ORG-PROF-1" },
    update: {},
    create: {
      id: "ORG-PROF-1",
      name: "Grupo Profissional de Oftalmologia",
      type: "PROFISSIONAL_GROUP",
      cnpj: "98.765.432/0001-01",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      phone: "+55 11 3001-1111",
    },
  });
  console.log(`✅ Organization created: ${professionalGroup.name}`);

  // Seed Users
  const adminUser = await prisma.user.upsert({
    where: { id: "USR-1" },
    update: {
      name: "Levy Administrativo",
      email: "admin@integravisao.com.br",
      role: "ADMINISTRATIVO",
      passwordHash,
      organizationId: null,
      isAdmin: false,
    },
    create: {
      id: "USR-1",
      name: "Levy Administrativo",
      email: "admin@integravisao.com.br",
      role: "ADMINISTRATIVO",
      passwordHash,
      organizationId: null,
      isAdmin: false,
    },
  });
  console.log(`✅ User created: ${adminUser.email} (ADMINISTRATIVO)`);

  const medicUser = await prisma.user.upsert({
    where: { id: "USR-2" },
    update: {
      name: "Dr. Fernando Silva",
      email: "medico@integravisao.com.br",
      role: "MEDICO",
      passwordHash,
      organizationId: clinica.id,
      isAdmin: true,
    },
    create: {
      id: "USR-2",
      name: "Dr. Fernando Silva",
      email: "medico@integravisao.com.br",
      role: "MEDICO",
      passwordHash,
      organizationId: clinica.id,
      isAdmin: true,
    },
  });
  console.log(
    `✅ User created: ${medicUser.email} (MEDICO, isAdmin=true at ${clinica.name})`,
  );

  const profUser = await prisma.user.upsert({
    where: { id: "USR-3" },
    update: {
      name: "Camila Profissional",
      email: "profissional@integravisao.com.br",
      role: "PROFISSIONAL",
      passwordHash,
      organizationId: professionalGroup.id,
      isAdmin: false,
    },
    create: {
      id: "USR-3",
      name: "Camila Profissional",
      email: "profissional@integravisao.com.br",
      role: "PROFISSIONAL",
      passwordHash,
      organizationId: professionalGroup.id,
      isAdmin: false,
    },
  });
  console.log(
    `✅ User created: ${profUser.email} (PROFISSIONAL at ${professionalGroup.name})`,
  );

  // Seed ProfessionalAccess (allows professionalGroup → clinica)
  const access = await prisma.professionalAccess.upsert({
    where: {
      professionalGroupId_clinicId: {
        professionalGroupId: professionalGroup.id,
        clinicId: clinica.id,
      },
    },
    update: {},
    create: {
      professionalGroupId: professionalGroup.id,
      clinicId: clinica.id,
    },
  });
  console.log(
    `✅ ProfessionalAccess created: ${professionalGroup.name} → ${clinica.name}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
