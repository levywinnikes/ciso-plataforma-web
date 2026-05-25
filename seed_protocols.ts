import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROTOCOLS = [
  {
    name: "Consulta Básica Médico Oftalmologista",
    price: 250,
    services: [{ name: "Consulta especialista", price: 250 }],
  },
  {
    name: "CONSULTA PROTOCOLO com EXAMES pré-CATARATA",
    price: 850,
    services: [
      { name: "Consulta especialista", price: 250 },
      { name: "Biometria ARGUS", price: 235 },
      { name: "Galilei", price: 300 },
      { name: "Micro", price: 230 },
      { name: "OCT", price: 315 },
      { name: "Mapeamento Retina (dilatação pupilar)", price: 180 },
    ],
  },
  {
    name: "CONSULTA PROTOCOLO com EXAMES GLAUCOMA",
    price: 650,
    services: [
      { name: "Consulta especialista", price: 250 },
      { name: "Tonometria aplanação", price: 70 },
      { name: "Gonioscopia", price: 130 },
      { name: "Galilei", price: 300 },
      { name: "OCT papila", price: 315 },
    ],
  },
  {
    name: "CONSULTA ESPECIALISTA com EXAMES RETINA",
    price: 550,
    services: [
      { name: "Consulta especialista", price: 250 },
      { name: "OCT Mácula", price: 315 },
      { name: "Mapeamento Retina (dilatação pupilar)", price: 180 },
      { name: "Retinografia de alta resolução", price: 0 },
    ],
  },
  {
    name: "CONSULTA ESPECIALISTA com EXAMES Refrativa LASER",
    price: 550,
    services: [
      { name: "Consulta especialista", price: 250 },
      { name: "Avaliação olho seco", price: 110 },
      { name: "Micro", price: 230 },
      { name: "Galilei", price: 300 },
      { name: "Mapeamento Retina (dilatação pupilar)", price: 180 },
    ],
  },
  {
    name: "CONSULTA ESPECIALISTA com EXAMES Ceratocone",
    price: 550,
    services: [
      { name: "Consulta especialista", price: 250 },
      { name: "Avaliação olho seco - superfície", price: 110 },
      { name: "Micro", price: 230 },
      { name: "Galilei", price: 300 },
      { name: "Teste LC rígida", price: 110 },
    ],
  },
];

async function main() {
  // First, extract all unique services
  const uniqueServices = new Map<string, number>();
  for (const protocol of PROTOCOLS) {
    for (const s of protocol.services) {
      if (!uniqueServices.has(s.name) || uniqueServices.get(s.name) === 0) {
        uniqueServices.set(s.name, s.price);
      }
    }
  }

  // Create global services
  const serviceIdMap = new Map<string, string>();
  for (const [name, price] of uniqueServices.entries()) {
    const service = await prisma.careService.create({
      data: { name, basePrice: price },
    });
    serviceIdMap.set(name, service.id);
  }

  // Create nuclei and link them
  for (const protocol of PROTOCOLS) {
    const nucleus = await prisma.careNucleus.create({
      data: {
        name: protocol.name,
        description: "Protocolo Oftalmológico",
        chargedPrice: protocol.price,
      },
    });

    for (const s of protocol.services) {
      const serviceId = serviceIdMap.get(s.name)!;
      await prisma.careNucleusService.create({
        data: {
          nucleusId: nucleus.id,
          serviceId: serviceId,
        },
      });
    }
  }

  console.log(
    "Seeded database successfully with new nuclei and global services!",
  );
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
