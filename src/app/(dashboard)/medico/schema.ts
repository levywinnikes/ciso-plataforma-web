import type { Referral } from "@/features/referrals/types";

export interface MedicoPageModel {
  selectedReferral: Referral | null;
  notes: string;
  conduct: string;
  files: string[];
  items: Referral[];
  appointmentDoctor: string;
  appointmentDate: string;
  availableDoctors: { id: string; name: string }[];
  setSelectedReferral: (referral: Referral | null) => void;
  setNotes: (value: string) => void;
  setConduct: (value: string) => void;
  setAppointmentDoctor: (value: string) => void;
  setAppointmentDate: (value: string) => void;
  handleOpenAtendimento: (referral: Referral) => void;
  handleAddFile: () => void;
  handleSave: () => void;
  handleSchedule: () => void;
}
