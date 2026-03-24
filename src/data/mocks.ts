export interface Patient {
  id: string;
  name: string;
  age: number;
  cpf: string;
}

export interface ProtocolService {
  name: string;
  price: number;
}

export interface Protocol {
  id: string;
  name: string;
  chargedPrice: number;
  services: ProtocolService[];
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientPhone?: string;
  patientDocument?: string;
  date: string;
  status: 'Encaminhado' | 'Agendado' | 'Atendido';
  protocolId: string;
  protocolName: string;
  observations: string;
  systemicDiseases?: string;
  appointmentDate?: string;
  report?: string;
  doctor?: string;
}

export const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'João Silva', age: 45, cpf: '123.456.789-00' },
  { id: '2', name: 'Maria Santos', age: 62, cpf: '987.654.321-11' },
  { id: '3', name: 'Pedro Costa', age: 28, cpf: '456.789.123-22' },
];

export const PROTOCOLS: Protocol[] = [
  {
    id: 'basica',
    name: 'PROTOCOLOS ESPECIALIZADOS - OFTALMOLOGIA',
    chargedPrice: 250,
    services: [
      { name: 'Consulta Básica Médico Oftalmologista', price: 250 }
    ]
  },
  {
    id: 'pre-catarata',
    name: 'CONSULTA PROTOCOLO com EXAMES pré-CATARATA',
    chargedPrice: 850,
    services: [
      { name: 'Consulta especialista', price: 250 },
      { name: 'Biometria ARGUS', price: 235 },
      { name: 'Galilei', price: 300 },
      { name: 'Micro', price: 230 },
      { name: 'OCT', price: 315 },
      { name: 'Mapeamento Retina (dilatação pupilar)', price: 180 },
    ]
  },
  {
    id: 'glaucoma',
    name: 'CONSULTA PROTOCOLO com EXAMES GLAUCOMA',
    chargedPrice: 650,
    services: [
      { name: 'Consulta especialista', price: 250 },
      { name: 'Tonometria aplanação', price: 70 },
      { name: 'Gonioscopia', price: 130 },
      { name: 'Galilei', price: 300 },
      { name: 'OCT papila', price: 315 },
    ]
  },
  {
    id: 'retina',
    name: 'CONSULTA ESPECIALISTA com EXAMES RETINA',
    chargedPrice: 550,
    services: [
      { name: 'Consulta especialista', price: 250 },
      { name: 'OCT Mácula', price: 315 },
      { name: 'Mapeamento Retina (dilatação pupilar)', price: 180 },
      { name: 'Retinografia de alta resolução', price: 250 },
    ]
  },
  {
    id: 'refrativa',
    name: 'CONSULTA ESPECIALISTA com EXAMES Refrativa LASER',
    chargedPrice: 550,
    services: [
      { name: 'Consulta especialista', price: 250 },
      { name: 'Avaliação olho seco', price: 110 },
      { name: 'Micro', price: 230 },
      { name: 'Galilei', price: 300 },
      { name: 'Mapeamento Retina (dilatação pupilar)', price: 180 },
    ]
  },
  {
    id: 'ceratocone',
    name: 'CONSULTA ESPECIALISTA com EXAMES Ceratocone',
    chargedPrice: 550,
    services: [
      { name: 'Consulta especialista', price: 250 },
      { name: 'Avaliação olho seco - superfície', price: 110 },
      { name: 'Micro', price: 230 },
      { name: 'Galilei', price: 300 },
      { name: 'Teste LC rígida', price: 110 },
    ]
  }
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'REF001',
    patientId: '1',
    patientName: 'João Silva',
    patientBirthDate: '15/05/1978',
    patientPhone: '(11) 98765-4321',
    patientDocument: '123.456.789-00',
    date: '10/03/2026',
    status: 'Encaminhado',
    protocolId: 'glaucoma',
    protocolName: 'CONSULTA PROTOCOLO com EXAMES GLAUCOMA',
    observations: 'Paciente apresenta pressão intraocular elevada em olho direito.',
    systemicDiseases: 'Hipertensão arterial controlada',
  },
  {
    id: 'REF002',
    patientId: '2',
    patientName: 'Maria Santos',
    patientBirthDate: '22/11/1963',
    patientPhone: '(11) 99888-7777',
    date: '08/03/2026',
    status: 'Agendado',
    protocolId: 'pre-catarata',
    protocolName: 'CONSULTA PROTOCOLO com EXAMES pré-CATARATA',
    observations: 'Diminuição da acuidade visual bilateral, pior em período noturno.',
    systemicDiseases: 'Diabetes tipo 2, asma',
    appointmentDate: '15/03/2026 10:00',
    doctor: 'Dr. Fernando Silva',
  },
  {
    id: 'REF003',
    patientId: '3',
    patientName: 'Pedro Costa',
    date: '05/03/2026',
    status: 'Atendido',
    protocolId: 'refrativa',
    protocolName: 'CONSULTA ESPECIALISTA com EXAMES Refrativa LASER',
    observations: 'Queixa de dor de cabeça ao ler.',
    appointmentDate: '07/03/2026 14:30',
    doctor: 'Dra. Aline Mendes',
    report: 'Prescrição de óculos para miopia e astigmatismo. Retorno 30 dias após cirurgia.',
  },
];

export const SPECIALTY_NUCLEI = [
  'Núcleo de Glaucoma',
  'Núcleo de Retina',
  'Núcleo de Córnea',
  'Núcleo de Catarata',
  'Núcleo de Cirurgia Refrativa',
  'Núcleo de Superfície Ocular',
];

export const CLINICAL_SUSPECTS = [
  'Glaucoma',
  'Alterações na Retina',
  'Ceratocone',
  'Catarata',
  'Necessidade Refrativa',
  'Olho Seco',
  'Estrabismo/Terapia Visual',
];
