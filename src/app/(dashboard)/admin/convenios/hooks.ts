"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import { type EditAgreementFormData, editAgreementSchema } from "./schema";

export interface AgreementRow {
  id: string;
  name: string;
  active: boolean;
}

export function useAgreementsManagement() {
  const [rows, setRows] = useState<AgreementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteAgreementId, setPendingDeleteAgreementId] = useState<
    string | null
  >(null);

  const toast = useAppToast();
  const tError = useFormError();
  const t = useTranslations("adminGlobal.agreements");

  const editForm = useForm<EditAgreementFormData>({
    resolver: zodResolver(editAgreementSchema),
    defaultValues: { name: "", active: true },
  });

  const createForm = useForm<EditAgreementFormData>({
    resolver: zodResolver(editAgreementSchema),
    defaultValues: { name: "", active: true },
  });

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(term));
  }, [rows, search]);

  async function loadData() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agreements", {
        cache: "no-store",
      });
      if (response.ok) {
        setRows((await response.json()) as AgreementRow[]);
      } else {
        toast.error(tError("errors.genericRequestFailed") ?? "");
      }
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function openEditModal(row: AgreementRow) {
    setEditingId(row.id);
    editForm.reset({
      name: row.name,
      active: row.active,
    });
    setIsEditModalOpen(true);
  }

  async function handleUpdateAgreement(data: EditAgreementFormData) {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/agreements/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          active: data.active,
        }),
      });

      if (!response.ok) {
        let errorKey = "errors.genericRequestFailed";
        try {
          const body = await response.json();
          if (body.error) errorKey = body.error;
        } catch {}
        toast.error(tError(errorKey) ?? "");
        return;
      }

      toast.success(t("agreementUpdatedSuccess"));
      setIsEditModalOpen(false);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function handleCreateAgreement(data: EditAgreementFormData) {
    try {
      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          active: data.active,
        }),
      });

      if (!response.ok) {
        let errorKey = "errors.genericRequestFailed";
        try {
          const body = await response.json();
          if (body.error) errorKey = body.error;
        } catch {}
        toast.error(tError(errorKey) ?? "");
        return;
      }

      toast.success(t("agreementCreatedSuccess"));
      createForm.reset();
      setIsCreateModalOpen(false);
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function handleDeleteAgreement(id: string) {
    try {
      const response = await fetch(`/api/agreements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let errorKey = "errors.genericRequestFailed";
        try {
          const body = await response.json();
          if (body.error) errorKey = body.error;
        } catch {}
        toast.error(tError(errorKey) ?? "");
        return;
      }

      toast.success(t("agreementDeletedSuccess"));
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  return {
    rows,
    isLoading,
    search,
    setSearch,
    filteredRows,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    pendingDeleteAgreementId,
    setPendingDeleteAgreementId,
    createForm,
    editForm,
    openEditModal,
    onCreateAgreement: createForm.handleSubmit(handleCreateAgreement),
    onUpdateAgreement: editForm.handleSubmit(handleUpdateAgreement),
    deleteAgreement: handleDeleteAgreement,
  };
}
