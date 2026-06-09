"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import { type EditServiceFormData, editServiceSchema } from "./schema";

export interface ServiceRow {
  id: string;
  name: string;
  basePrice: number;
}

export function useServicesManagement() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteServiceId, setPendingDeleteServiceId] = useState<
    string | null
  >(null);

  const toast = useAppToast();
  const tError = useFormError();
  const t = useTranslations("adminGlobal.services");

  const editForm = useForm<EditServiceFormData>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: { name: "", price: undefined },
  });

  const createForm = useForm<EditServiceFormData>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: { name: "", price: undefined },
  });

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(term));
  }, [rows, search]);

  async function loadData() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/services", {
        cache: "no-store",
      });
      if (response.ok) {
        setRows((await response.json()) as ServiceRow[]);
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

  function openEditModal(row: ServiceRow) {
    setEditingId(row.id);
    editForm.reset({
      name: row.name,
      price: row.basePrice,
    });
    setIsEditModalOpen(true);
  }

  async function handleUpdateService(data: EditServiceFormData) {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          basePrice: data.price,
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

      toast.success(t("serviceUpdatedSuccess"));
      setIsEditModalOpen(false);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function handleCreateService(data: EditServiceFormData) {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          basePrice: data.price,
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

      toast.success(t("serviceCreatedSuccess"));
      createForm.reset();
      setIsCreateModalOpen(false);
      await loadData();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function handleDeleteService(id: string) {
    try {
      const response = await fetch(`/api/services/${id}`, {
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

      toast.success(t("serviceDeletedSuccess"));
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
    pendingDeleteServiceId,
    setPendingDeleteServiceId,
    createForm,
    editForm,
    openEditModal,
    onCreateService: createForm.handleSubmit(handleCreateService),
    onUpdateService: editForm.handleSubmit(handleUpdateService),
    deleteService: handleDeleteService,
  };
}
