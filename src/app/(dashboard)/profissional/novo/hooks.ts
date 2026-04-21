"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { CARE_NUCLEI } from "@/features/referrals/data";

import type {
  NovoEncaminhamentoFormData,
  NovoEncaminhamentoPageModel,
  UploadedDocument,
} from "./schema";
import { novoEncaminhamentoSchema } from "./schema";

export function useNovoEncaminhamentoPageModel(): NovoEncaminhamentoPageModel {
  const router = useRouter();

  const form = useForm<NovoEncaminhamentoFormData>({
    resolver: zodResolver(novoEncaminhamentoSchema),
    defaultValues: {
      patientName: "",
      patientBirthDate: "",
      patientPhone: "",
      patientDocument: "",
      systemicDiseases: "",
      clinicalNotes: "",
      clinicalSuspect: "",
      nucleusId: "",
    },
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const nucleusId = form.watch("nucleusId");
  const selectedNucleus = CARE_NUCLEI.find((item) => item.id === nucleusId);

  const handleFakeUpload = () => {
    setDocuments((current) => [
      ...current,
      { id: `DOC-${Date.now()}`, name: `documento-${current.length + 1}.pdf` },
    ]);
  };

  const handleFormSubmit = async (data: NovoEncaminhamentoFormData) => {
    if (!selectedNucleus) return;

    await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: data.patientName,
        patientBirthDate: data.patientBirthDate,
        patientPhone: data.patientPhone,
        patientDocument: data.patientDocument || undefined,
        systemicDiseases: data.systemicDiseases || undefined,
        clinicalNotes: [data.clinicalSuspect, data.clinicalNotes]
          .filter(Boolean)
          .join(" - "),
        nucleusId: selectedNucleus.id,
        documents: documents.map((item) => ({
          id: item.id,
          name: item.name,
          uploadedAt: new Date().toISOString(),
        })),
      }),
    });

    router.push("/profissional");
    router.refresh();
  };

  return {
    form,
    onSubmit: form.handleSubmit(handleFormSubmit),
    documents,
    selectedNucleus,
    handleFakeUpload,
  };
}
