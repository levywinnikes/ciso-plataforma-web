import type { Dispatch, SetStateAction } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { CareNucleus, Referral } from "@/features/referrals/types";

import type {
  ClinicOption,
  NovoEncaminhamentoFormData,
  UploadedDocument,
} from "./novo/schema";

export interface ReferralFilters {
  status: string;
  doctor: string;
  nucleus: string;
  date: string;
}

export type ReferralListTab = "active" | "blocked" | "calendar";

export interface ProfissionalPageModel {
  // Data
  isLoading: boolean;
  referrals: Referral[];
  filteredReferrals: Referral[];
  blockedCount: number;

  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;

  // Filtering
  listTab: ReferralListTab;
  setListTab: Dispatch<SetStateAction<ReferralListTab>>;
  filters: ReferralFilters;
  setFilters: Dispatch<SetStateAction<ReferralFilters>>;

  // Modal
  selectedReferral: Referral | null;
  isModalOpen: boolean;
  openModal: (referral: Referral) => void;
  closeModal: () => void;

  // Edit Modal
  selectedReferralForEdit: Referral | null;
  isEditModalOpen: boolean;
  openEditModal: (referral: Referral) => void;
  closeEditModal: () => void;
  editForm: UseFormReturn<NovoEncaminhamentoFormData>;
  onSubmitEdit: (event: React.BaseSyntheticEvent) => void;
  editClinics: ClinicOption[];
  editNuclei: CareNucleus[];
  editSelectedNucleus?: CareNucleus;
  isSavingEdit: boolean;
  editDocuments: UploadedDocument[];
  handleUploadFilesEdit: (files: File[]) => Promise<void>;
  handleRemoveDocumentEdit: (id: string) => void;
  isUploadingEdit: boolean;

  // Actions
  deleteReferral: (id: string) => Promise<void>;
  calendarRefreshKey: number;
}
