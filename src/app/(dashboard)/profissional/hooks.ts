"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { toBirthDateInputValue } from "@/features/referrals/birth-date";
import { fetchReferralsPage } from "@/features/referrals/fetch-referrals";
import type { CareNucleus, Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";
import { uploadFilesToStorage } from "@/lib/upload-client";

import {
  ClinicOption,
  NovoEncaminhamentoFormData,
  novoEncaminhamentoSchema,
  UploadedDocument,
} from "./novo/schema";
import type {
  ProfissionalPageModel,
  ReferralFilters,
  ReferralListTab,
} from "./schema";

const ITEMS_PER_PAGE = 10;

export function useProfissionalPageModel(): ProfissionalPageModel {
  const toast = useAppToast();
  const tError = useFormError();
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  const [listTab, setListTab] = useState<ReferralListTab>("calendar");
  const [filters, setFilters] = useState<ReferralFilters>({
    status: "ALL",
    doctor: "ALL",
    nucleus: "ALL",
    date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedReferralForEdit, setSelectedReferralForEdit] =
    useState<Referral | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClinics, setEditClinics] = useState<ClinicOption[]>([]);
  const [editNuclei, setEditNuclei] = useState<CareNucleus[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
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
      status: "Encaminhado",
      justificativaBloqueio: "",
    },
  });

  const reloadList = useCallback(async () => {
    if (listTab === "calendar") {
      setIsLoading(true);
      try {
        const result = await fetchReferralsPage({
          page: 1,
          pageSize: 1,
          includeCounts: true,
        });
        setBlockedCount(result.counts?.bloqueado ?? 0);
        setReferrals([]);
        setTotalPages(1);
      } catch {
        toast.error(tError("errors.genericRequestFailed") ?? "");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchReferralsPage({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        tab: listTab === "blocked" ? "blocked" : "active",
        status: listTab === "active" ? filters.status : undefined,
        includeCounts: true,
      });

      let items = result.items;
      if (filters.doctor !== "ALL") {
        items = items.filter((referral) => {
          if (filters.doctor === "A definir") return !referral.doctor;
          return referral.doctor === filters.doctor;
        });
      }
      if (filters.nucleus !== "ALL") {
        items = items.filter(
          (referral) => referral.nucleusName === filters.nucleus,
        );
      }
      if (filters.date) {
        items = items.filter((referral) =>
          referral.createdAt.startsWith(filters.date),
        );
      }

      setReferrals(items);
      setTotalPages(result.totalPages);
      setBlockedCount(result.counts?.bloqueado ?? 0);
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
    // toast/tError mudam a cada render — não incluir nas deps (evita loop infinito)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/tError instáveis
  }, [
    listTab,
    currentPage,
    filters.status,
    filters.doctor,
    filters.nucleus,
    filters.date,
  ]);

  useEffect(() => {
    void reloadList();
  }, [reloadList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listTab, filters.status, filters.doctor, filters.nucleus, filters.date]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/referrals/clinics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && isMounted) setEditClinics(data);
      })
      .catch((err) => console.error("Failed to fetch clinics", err));

    fetch("/api/nuclei")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && isMounted) setEditNuclei(data);
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

  const handleUploadFilesEdit = async (files: File[]) => {
    setIsUploadingEdit(true);
    try {
      const uploaded = await uploadFilesToStorage(files);
      setEditDocuments((current) => [...current, ...uploaded]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "errors.uploadFailed";
      toast.error(tError(message) ?? "");
    } finally {
      setIsUploadingEdit(false);
    }
  };

  const handleRemoveDocumentEdit = (id: string) => {
    setEditDocuments((current) => current.filter((item) => item.id !== id));
  };

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
      patientBirthDate: toBirthDateInputValue(referral.patientBirthDate || ""),
      patientPhone: referral.patientPhone || "",
      patientDocument: referral.patientDocument || "",
      systemicDiseases: referral.systemicDiseases || "",
      clinicalNotes: referral.clinicalNotes || "",
      nucleusId: referral.nucleusId || "",
      clinicId: referral.clinicId || "",
      agreementId: referral.agreementId || "",
      status: referral.status === "Bloqueado" ? "Bloqueado" : "Encaminhado",
      justificativaBloqueio: referral.justificativaBloqueio || "",
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
            status: data.status,
            justificativaBloqueio:
              data.status === "Bloqueado"
                ? data.justificativaBloqueio?.trim()
                : undefined,
            documents: editDocuments.map((item) => ({
              id: item.id,
              name: item.name,
              url: item.key || item.url,
              uploadedAt: item.uploadedAt ?? new Date().toISOString(),
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

      toast.success("Encaminhamento editado com sucesso!");
      closeEditModal();
      setCalendarRefreshKey((key) => key + 1);
      await reloadList();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar as alterações.";
      toast.error(message);
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
      setCalendarRefreshKey((key) => key + 1);
      await reloadList();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Não foi possível excluir.";
      toast.error(message);
    }
  };

  return {
    isLoading,
    referrals,
    filteredReferrals: referrals,
    blockedCount,
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    filters,
    setFilters,
    listTab,
    setListTab,
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
    handleUploadFilesEdit,
    handleRemoveDocumentEdit,
    isUploadingEdit,
    deleteReferral,
    calendarRefreshKey,
  };
}
