"use client";

import { useEffect, useState } from "react";

import type { Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";

import type { ProfissionalPageModel, ReferralFilters } from "./schema";

const ITEMS_PER_PAGE = 10;

export function useProfissionalPageModel(): ProfissionalPageModel {
  const toast = useAppToast();
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Filtering
  const [filters, setFilters] = useState<ReferralFilters>({
    status: "ALL",
    doctor: "ALL",
    nucleus: "ALL",
    date: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReferrals() {
      try {
        const response = await fetch("/api/referrals", { cache: "no-store" });
        const data = (await response.json()) as Referral[];

        if (isMounted) {
          setReferrals(data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReferrals();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtering Logic
  const filteredReferrals = referrals.filter((referral) => {
    let match = true;

    if (filters.status !== "ALL" && referral.status !== filters.status) {
      match = false;
    }

    if (filters.doctor !== "ALL") {
      // Logic for doctor filter: If referral.doctor exists and matches, or if we filter by "A definir"
      if (filters.doctor === "A definir" && referral.doctor) match = false;
      else if (
        filters.doctor !== "A definir" &&
        referral.doctor !== filters.doctor
      )
        match = false;
    }

    if (filters.nucleus !== "ALL" && referral.nucleusName !== filters.nucleus) {
      match = false;
    }

    if (filters.date) {
      // simple date match: format is YYYY-MM-DD from input date
      if (referral.createdAt !== filters.date) {
        match = false;
      }
    }

    return match;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredReferrals.length / ITEMS_PER_PAGE) || 1;
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openModal = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedReferral(null), 200);
  };

  const deleteReferral = async (id: string) => {
    try {
      const response = await fetch(`/api/referrals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao excluir encaminhamento");
      }

      toast.success("Encaminhamento excluído.");

      setReferrals((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Não foi possível excluir.");
    }
  };

  return {
    isLoading,
    referrals,
    filteredReferrals: paginatedReferrals, // We return the paginated list as the final list to render
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    filters,
    setFilters,
    selectedReferral,
    isModalOpen,
    openModal,
    closeModal,
    deleteReferral,
  };
}
