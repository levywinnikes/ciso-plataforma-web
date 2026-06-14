"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import { type EditSurgeryFormData, editSurgerySchema } from "./schema";

export interface SurgeryRow {
  id: string;
  name: string;
  defaultPrice: number;
  active: boolean;
}

export function useSurgeriesManagement() {
  const [rows, setRows] = useState<SurgeryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteSurgeryId, setPendingDeleteSurgeryId] = useState<
    string | null
  >(null);

  const toast = useAppToast();
  const tError = useFormError();
  const t = useTranslations("adminGlobal.surgeries");

  const editForm = useForm<EditSurgeryFormData>({
    resolver: zodResolver(editSurgerySchema),
    defaultValues: { name: "", defaultPrice: 0, active: true },
  });

  const createForm = useForm<EditSurgeryFormData>({
    resolver: zodResolver(editSurgerySchema),
    defaultValues: { name: "", defaultPrice: 0, active: true },
  });

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(term));
  }, [rows, search]);

  async function loadData() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/surgeries", {
        cache: "no-store",
      });
      if (response.ok) {
        setRows((await response.json()) as SurgeryRow[]);
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

  function openEditModal(row: SurgeryRow) {
    setEditingId(row.id);
    editForm.reset({
      name: row.name,
      defaultPrice: row.defaultPrice,
      active: row.active,
    });
    setIsEditModalOpen(true);
  }

  async function handleUpdateSurgery(data: EditSurgeryFormData) {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/surgeries/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          defaultPrice: data.defaultPrice,
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

      toast.success(t("surgeryUpdatedSuccess"));
      setIsEditModalOpen(false);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function handleCreateSurgery(data: EditSurgeryFormData) {
    try {
      const response = await fetch("/api/surgeries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          defaultPrice: data.defaultPrice,
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

      toast.success(t("surgeryCreatedSuccess"));
      createForm.reset();
      setIsCreateModalOpen(false);
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function handleDeleteSurgery(id: string) {
    try {
      const response = await fetch(`/api/surgeries/${id}`, {
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

      toast.success(t("surgeryDeletedSuccess"));
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
    pendingDeleteSurgeryId,
    setPendingDeleteSurgeryId,
    createForm,
    editForm,
    openEditModal,
    onCreateSurgery: createForm.handleSubmit(handleCreateSurgery),
    onUpdateSurgery: editForm.handleSubmit(handleUpdateSurgery),
    deleteSurgery: handleDeleteSurgery,
  };
}
