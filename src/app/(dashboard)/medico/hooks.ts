"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import type { Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";
import { uploadFilesToStorage } from "@/lib/upload-client";

import type { MedicoPageModel, MedicoUploadedFile } from "./schema";

export function useMedicoPageModel(): MedicoPageModel {
  const toast = useAppToast();
  const tError = useFormError();
  const t = useTranslations("doctor");

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notes, setNotes] = useState("");
  const [conduct, setConduct] = useState("");
  const [files, setFiles] = useState<MedicoUploadedFile[]>([]);
  const [surgeryId, setSurgeryId] = useState("");
  const [surgeryPrice, setSurgeryPrice] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const refResponse = await fetch("/api/referrals", {
          cache: "no-store",
        });

        const refData = (await refResponse.json()) as Referral[];

        if (isMounted) {
          setReferrals(refData);
        }
      } catch (e) {
        console.error(e);
        toast.error(tError("errors.genericRequestFailed") ?? "");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(
    () =>
      referrals.filter(
        (referral) =>
          referral.status === "Agendado" || referral.status === "Atendido",
      ),
    [referrals],
  );

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
        setReferrals((current) =>
          current.map((item) =>
            item.id === selectedReferral.id
              ? {
                  ...item,
                  specialistNotes: notes,
                  specialistConduct: conduct,
                  surgeryId: surgeryId || undefined,
                  surgeryPrice: surgeryPrice !== "" ? surgeryPrice : undefined,
                  specialistAttachments: files.map((file) => ({
                    id: file.id,
                    name: file.name,
                    url: file.url,
                    uploadedAt: file.uploadedAt ?? new Date().toISOString(),
                  })),
                  status: complete ? "Atendido" : item.status,
                }
              : item,
          ),
        );
        toast.success(complete ? t("completeSuccess") : t("saveSuccess"));
        setSelectedReferral(null);
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
