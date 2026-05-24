import type { Dispatch, SetStateAction } from "react";

import type { Referral } from "@/features/referrals/types";

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
}
