import type { CareNucleus, Referral } from "./types";

export const CARE_NUCLEI: CareNucleus[] = [
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

export const CLINICAL_SUSPECTS = [
  "Glaucoma",
  "Alteracoes na Retina",
  "Ceratocone",
  "Catarata",
  "Cirurgia Refrativa",
  "Olho Seco",
  "Estrabismo/Terapia Visual",
];

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: "REF-001",
    patientName: "Joao Silva",
    patientBirthDate: "1978-05-15",
    patientPhone: "(11) 98765-4321",
    patientDocument: "123.456.789-00",
    systemicDiseases: "Hipertensao arterial controlada",
    clinicalNotes: "Pressao intraocular elevada em olho direito.",
    createdAt: "2026-03-10",
    status: "Encaminhado",
    nucleusId: "glaucoma",
    nucleusName: "Nucleo de Atendimento - Glaucoma",
    documents: [
      { id: "DOC-1", name: "retinografia-joao.pdf", uploadedAt: "2026-03-10" },
    ],
  },
  {
    id: "REF-002",
    patientName: "Maria Santos",
    patientBirthDate: "1963-11-22",
    patientPhone: "(11) 99888-7777",
    systemicDiseases: "Diabetes tipo 2",
    clinicalNotes: "Reducao de acuidade visual bilateral.",
    createdAt: "2026-03-08",
    status: "Agendado",
    nucleusId: "catarata",
    nucleusName: "Nucleo de Atendimento - Catarata",
    appointmentDate: "2026-03-15T10:00:00",
    doctor: "Dr. Fernando Silva",
  },
  {
    id: "REF-003",
    patientName: "Pedro Costa",
    patientBirthDate: "1991-01-17",
    patientPhone: "(11) 97777-6666",
    createdAt: "2026-03-05",
    status: "Atendido",
    nucleusId: "cirurgia-refrativa",
    nucleusName: "Nucleo de Atendimento - Cirurgia Refrativa",
    appointmentDate: "2026-03-07T14:30:00",
    doctor: "Dra. Aline Mendes",
    specialistNotes: "Paciente com boa espessura corneana para procedimento.",
    specialistConduct: "Agendar cirurgia e retorno em 30 dias.",
  },
];
