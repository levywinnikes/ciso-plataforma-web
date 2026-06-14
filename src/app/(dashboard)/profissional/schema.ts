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

export interface ProfissionalPageModel {
  // Data
  isLoading: boolean;
  referrals: Referral[];
  filteredReferrals: Referral[];

  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;

  // Filtering
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
  handleFakeUploadEdit: () => void;

  // Actions
  deleteReferral: (id: string) => Promise<void>;
}
