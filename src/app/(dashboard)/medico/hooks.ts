"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import type { Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import type { MedicoPageModel } from "./schema";

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
  const [files, setFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    setFiles((referral.specialistAttachments ?? []).map((item) => item.name));
  };

  const handleAddFile = () => {
    setFiles((current) => [...current, `arquivo-${current.length + 1}.pdf`]);
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
            files: files.map((file, index) => ({
              id: `SPC-${index + 1}`,
              name: file,
              uploadedAt: new Date().toISOString(),
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
                  specialistAttachments: files.map((file, index) => ({
                    id: `SPC-${index + 1}`,
                    name: file,
                    uploadedAt: new Date().toISOString(),
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
    setSelectedReferral,
    setNotes,
    setConduct,
    handleOpenAtendimento,
    handleAddFile,
    handleSave,
    isConfirmOpen,
    setIsConfirmOpen,
    handleCompleteClick,
    handleConfirmComplete,
  };
}
