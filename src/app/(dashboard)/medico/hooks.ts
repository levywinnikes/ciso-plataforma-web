"use client";

import { useEffect, useMemo, useState } from "react";

import type { Referral } from "@/features/referrals/types";

import type { MedicoPageModel } from "./schema";

export function useMedicoPageModel(): MedicoPageModel {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notes, setNotes] = useState("");
  const [conduct, setConduct] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadReferrals() {
      const response = await fetch("/api/referrals", { cache: "no-store" });
      const data = (await response.json()) as Referral[];

      if (isMounted) {
        setReferrals(data);
      }
    }

    void loadReferrals();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(
    () =>
      referrals.filter(
        (referral) =>
          referral.status === "Agendado" || referral.status === "Encaminhado",
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

  const handleSave = async () => {
    if (!selectedReferral) {
      return;
    }

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
                status: "Atendido",
              }
            : item,
        ),
      );
    }

    setSelectedReferral(null);
  };

  return {
    selectedReferral,
    notes,
    conduct,
    files,
    items,
    setSelectedReferral,
    setNotes,
    setConduct,
    handleOpenAtendimento,
    handleAddFile,
    handleSave,
  };
}
