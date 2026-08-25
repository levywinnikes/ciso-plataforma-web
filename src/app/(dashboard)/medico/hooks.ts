"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { fetchReferralsPage } from "@/features/referrals/fetch-referrals";
import type { Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";
import { uploadFilesToStorage } from "@/lib/upload-client";

import type { MedicoPageModel, MedicoUploadedFile } from "./schema";

const ITEMS_PER_PAGE = 10;

export function useMedicoPageModel(): MedicoPageModel {
  const toast = useAppToast();
  const tError = useFormError();
  const t = useTranslations("doctor");

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [items, setItems] = useState<Referral[]>([]);
  const [viewTab, setViewTab] = useState<"calendar" | "list">("calendar");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notes, setNotes] = useState("");
  const [conduct, setConduct] = useState("");
  const [files, setFiles] = useState<MedicoUploadedFile[]>([]);
  const [surgeryId, setSurgeryId] = useState("");
  const [surgeryPrice, setSurgeryPrice] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const reloadList = useCallback(async () => {
    if (viewTab !== "list") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await fetchReferralsPage({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
    } catch (e) {
      console.error(e);
      toast.error(tError("errors.genericRequestFailed") ?? "");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/tError instáveis a cada render
  }, [viewTab, currentPage]);

  useEffect(() => {
    void reloadList();
  }, [reloadList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewTab]);

  const handleOpenAtendimento = (referral: Referral) => {
    setSelectedReferral(referral);
    setNotes(referral.specialistNotes ?? "");
    setConduct(referral.specialistConduct ?? "");
    setFiles(
      (referral.specialistAttachments ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        key: item.key,
        uploadedAt: item.uploadedAt,
      })),
    );
    setSurgeryId(referral.surgeryId ?? "");
    setSurgeryPrice(
      referral.surgeryPrice !== undefined && referral.surgeryPrice !== null
        ? referral.surgeryPrice
        : "",
    );
  };

  const handleUploadFiles = async (selectedFiles: File[]) => {
    setIsUploading(true);
    try {
      const uploaded = await uploadFilesToStorage(selectedFiles);
      setFiles((current) => [...current, ...uploaded]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "errors.uploadFailed";
      toast.error(tError(message) ?? "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleSave = async (complete: boolean = false) => {
    if (!selectedReferral) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/referrals/${selectedReferral.id}/specialist`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes,
            conduct,
            surgeryId: surgeryId || null,
            surgeryPrice: surgeryPrice !== "" ? surgeryPrice : null,
            files: files.map((file) => ({
              id: file.id,
              name: file.name,
              url: file.key || file.url,
              uploadedAt: file.uploadedAt ?? new Date().toISOString(),
            })),
            complete,
          }),
        },
      );

      if (response.ok) {
        toast.success(complete ? t("completeSuccess") : t("saveSuccess"));
        setSelectedReferral(null);
        await reloadList();
      } else {
        toast.error(tError("errors.genericRequestFailed") ?? "");
      }
    } catch (e) {
      console.error(e);
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmComplete = async () => {
    setIsConfirmOpen(false);
    await handleSave(true);
  };

  return {
    selectedReferral,
    notes,
    conduct,
    files,
    items,
    viewTab,
    setViewTab,
    currentPage,
    setCurrentPage,
    totalPages,
    isLoading,
    isSaving,
    isUploading,
    surgeryId,
    setSurgeryId,
    surgeryPrice,
    setSurgeryPrice,
    setSelectedReferral,
    setNotes,
    setConduct,
    handleOpenAtendimento,
    handleUploadFiles,
    handleRemoveFile,
    handleSave,
    isConfirmOpen,
    setIsConfirmOpen,
    handleCompleteClick,
    handleConfirmComplete,
  };
}
