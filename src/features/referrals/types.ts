export type ReferralStatus = "Encaminhado" | "Agendado" | "Atendido";

export interface NucleusService {
  id: string;
  name: string;
  basePrice: number;
}

export interface CareNucleus {
  id: string;
  name: string;
  description: string;
  chargedPrice: number;
  services: NucleusService[];
}

export interface ReferralDocument {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface Referral {
  id: string;
  patientName: string;
  patientBirthDate: string;
  patientPhone: string;
  patientDocument?: string;
  systemicDiseases?: string;
  clinicalNotes?: string;
  clinicalSuspicion?: string;
  createdAt: string;
  status: ReferralStatus;
  nucleusId: string;
  nucleusName: string;
  organizationId?: string;
  organizationName?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  appointmentDate?: string;
  doctor?: string;
  specialistNotes?: string;
  specialistConduct?: string;
  specialistAttachments?: ReferralDocument[];
  documents?: ReferralDocument[];
}
