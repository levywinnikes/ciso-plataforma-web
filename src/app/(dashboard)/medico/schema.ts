import type { Referral } from "@/features/referrals/types";

export interface MedicoPageModel {
  selectedReferral: Referral | null;
  notes: string;
  conduct: string;
  files: string[];
  items: Referral[];
  isLoading: boolean;
  isSaving: boolean;
  surgeryId: string;
  setSurgeryId: (value: string) => void;
  surgeryPrice: number | "";
  setSurgeryPrice: (value: number | "") => void;
  setSelectedReferral: (referral: Referral | null) => void;
  setNotes: (value: string) => void;
  setConduct: (value: string) => void;
  handleOpenAtendimento: (referral: Referral) => void;
  handleAddFile: () => void;
  handleSave: (complete?: boolean) => Promise<void>;
  isConfirmOpen: boolean;
  setIsConfirmOpen: (open: boolean) => void;
  handleCompleteClick: () => void;
  handleConfirmComplete: () => Promise<void>;
}
