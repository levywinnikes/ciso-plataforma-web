import type { Dispatch, SetStateAction } from "react";

import type { Referral } from "@/features/referrals/types";

export interface MedicoUploadedFile {
  id: string;
  name: string;
  url?: string;
  key?: string;
  uploadedAt?: string;
}

export interface MedicoPageModel {
  selectedReferral: Referral | null;
  notes: string;
  conduct: string;
  files: MedicoUploadedFile[];
  items: Referral[];
  viewTab: "calendar" | "list";
  setViewTab: Dispatch<SetStateAction<"calendar" | "list">>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  isLoading: boolean;
  isSaving: boolean;
  isUploading: boolean;
  surgeryId: string;
  setSurgeryId: (value: string) => void;
  surgeryPrice: number | "";
  setSurgeryPrice: (value: number | "") => void;
  setSelectedReferral: (referral: Referral | null) => void;
  setNotes: (value: string) => void;
  setConduct: (value: string) => void;
  handleOpenAtendimento: (referral: Referral) => void;
  handleUploadFiles: (files: File[]) => Promise<void>;
  handleRemoveFile: (id: string) => void;
  handleSave: (complete?: boolean) => Promise<void>;
  isConfirmOpen: boolean;
  setIsConfirmOpen: (open: boolean) => void;
  handleCompleteClick: () => void;
  handleConfirmComplete: () => Promise<void>;
}
