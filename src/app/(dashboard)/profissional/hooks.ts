"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { CareNucleus, Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";

import {
  ClinicOption,
  NovoEncaminhamentoFormData,
  novoEncaminhamentoSchema,
  UploadedDocument,
} from "./novo/schema";
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

  // Modal (View Only)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Modal & Form
  const [selectedReferralForEdit, setSelectedReferralForEdit] =
    useState<Referral | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClinics, setEditClinics] = useState<ClinicOption[]>([]);
  const [editNuclei, setEditNuclei] = useState<CareNucleus[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editDocuments, setEditDocuments] = useState<UploadedDocument[]>([]);

  const editForm = useForm<NovoEncaminhamentoFormData>({
    resolver: zodResolver(novoEncaminhamentoSchema),
    defaultValues: {
      patientName: "",
      patientBirthDate: "",
      patientPhone: "",
      patientDocument: "",
      systemicDiseases: "",
      clinicalNotes: "",
      nucleusId: "",
      clinicId: "",
      agreementId: "",
    },
  });

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

    // Fetch clinics and nuclei options for the edit form
    fetch("/api/referrals/clinics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && isMounted) {
          setEditClinics(data);
        }
      })
      .catch((err) => console.error("Failed to fetch clinics", err));

    fetch("/api/nuclei")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && isMounted) {
          setEditNuclei(data);
        }
      })
      .catch((err) => console.error("Failed to fetch nuclei", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const editNucleusId = editForm.watch("nucleusId");
  const editSelectedNucleus = editNuclei.find(
    (item) => item.id === editNucleusId,
  );

  const editClinicId = editForm.watch("clinicId");
  useEffect(() => {
    editForm.setValue("agreementId", "");
  }, [editClinicId, editForm]);

  const handleFakeUploadEdit = () => {
    setEditDocuments((current) => [
      ...current,
      { id: `DOC-${Date.now()}`, name: `documento-${current.length + 1}.pdf` },
    ]);
  };

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

  const openEditModal = (referral: Referral) => {
    setSelectedReferralForEdit(referral);
    setIsEditModalOpen(true);

    editForm.reset({
      patientName: referral.patientName || "",
      patientBirthDate: referral.patientBirthDate || "",
      patientPhone: referral.patientPhone || "",
      patientDocument: referral.patientDocument || "",
      systemicDiseases: referral.systemicDiseases || "",
      clinicalNotes: referral.clinicalNotes || "",
      nucleusId: referral.nucleusId || "",
      clinicId: referral.clinicId || "",
      agreementId: referral.agreementId || "",
    });

    if (referral.documents) {
      setEditDocuments(referral.documents);
    } else {
      setEditDocuments([]);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setSelectedReferralForEdit(null);
      editForm.reset();
      setEditDocuments([]);
    }, 200);
  };

  const handleEditSubmit = async (data: NovoEncaminhamentoFormData) => {
    if (!selectedReferralForEdit) return;

    setIsSavingEdit(true);
    try {
      const response = await fetch(
        `/api/referrals/${selectedReferralForEdit.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName: data.patientName,
            patientBirthDate: data.patientBirthDate,
            patientPhone: data.patientPhone,
            patientDocument: data.patientDocument || undefined,
            systemicDiseases: data.systemicDiseases || undefined,
            clinicalNotes: data.clinicalNotes || undefined,
            nucleusId: data.nucleusId,
            clinicId: data.clinicId,
            agreementId: data.agreementId || undefined,
            documents: editDocuments.map((item) => ({
              id: item.id,
              name: item.name,
              uploadedAt: new Date().toISOString(),
            })),
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        toast.error(
          err.message || "Erro ao salvar o encaminhamento. Tente novamente.",
        );
        return;
      }

      const updated = (await response.json()) as Referral;
      toast.success("Encaminhamento editado com sucesso!");

      setReferrals((prev) =>
        prev.map((r) => (r.id === selectedReferralForEdit.id ? updated : r)),
      );

      closeEditModal();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar as alterações.");
      console.error(error);
    } finally {
      setIsSavingEdit(false);
    }
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
    selectedReferralForEdit,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    editForm,
    onSubmitEdit: editForm.handleSubmit(handleEditSubmit),
    editClinics,
    editNuclei,
    editSelectedNucleus,
    isSavingEdit,
    editDocuments,
    handleFakeUploadEdit,
    deleteReferral,
  };
}
