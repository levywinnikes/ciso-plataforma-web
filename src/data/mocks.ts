export interface Patient {
  id: string;
  name: string;
  age: number;
  cpf: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: 'Aguardando Triagem' | 'Agendado' | 'Finalizado';
  suspect: string;
  observations: string;
  nucleus?: string;
  appointmentDate?: string;
  report?: string;
}

export const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'João Silva', age: 45, cpf: '123.456.789-00' },
  { id: '2', name: 'Maria Santos', age: 62, cpf: '987.654.321-11' },
  { id: '3', name: 'Pedro Costa', age: 28, cpf: '456.789.123-22' },
];

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'REF001',
    patientId: '1',
    patientName: 'João Silva',
    date: '10/03/2026',
    status: 'Aguardando Triagem',
    suspect: 'Glaucoma',
    observations: 'Paciente apresenta pressão intraocular elevada.',
  },
  {
    id: 'REF002',
    patientId: '2',
    patientName: 'Maria Santos',
    date: '08/03/2026',
    status: 'Agendado',
    suspect: 'Catarata',
    observations: 'Diminuição da acuidade visual bilateral.',
    nucleus: 'Núcleo de Catarata',
    appointmentDate: '15/03/2026 10:00',
  },
  {
    id: 'REF003',
    patientId: '3',
    patientName: 'Pedro Costa',
    date: '05/03/2026',
    status: 'Finalizado',
    suspect: 'Necessidade Refrativa',
    observations: 'Queixa de dor de cabeça ao ler.',
    nucleus: 'Núcleo de Cirurgia Refrativa',
    appointmentDate: '07/03/2026 14:30',
    report: 'Prescrição de óculos para miopia e astigmatismo.',
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
