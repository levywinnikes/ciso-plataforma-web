"use client";

import { useState } from "react";

import {
  appendSpecialistUpdate,
  listReferrals,
} from "@/features/referrals/service";
import type { Referral } from "@/features/referrals/types";

import type { MedicoPageModel } from "./schema";

export function useMedicoPageModel(): MedicoPageModel {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [notes, setNotes] = useState("");
  const [conduct, setConduct] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const items = listReferrals().filter(
    (referral) => referral.status === "Agendado",
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

  const handleSave = () => {
    if (!selectedReferral) {
      return;
    }

    appendSpecialistUpdate({
      referralId: selectedReferral.id,
      notes,
      conduct,
      files: files.map((file, index) => ({
        id: `SPC-${index + 1}`,
        name: file,
        uploadedAt: new Date().toISOString(),
      })),
    });

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
