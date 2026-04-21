import type { Referral } from "@/features/referrals/types";

export interface MedicoPageModel {
  selectedReferral: Referral | null;
  notes: string;
  conduct: string;
  files: string[];
  items: Referral[];
  setSelectedReferral: (referral: Referral | null) => void;
  setNotes: (value: string) => void;
  setConduct: (value: string) => void;
  handleOpenAtendimento: (referral: Referral) => void;
  handleAddFile: () => void;
  handleSave: () => void;
}
