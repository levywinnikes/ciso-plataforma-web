"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { CARE_NUCLEI } from "@/features/referrals/data";

import type {
  ClinicOption,
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
      clinicId: "",
    },
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);

  useEffect(() => {
    fetch("/api/referrals/clinics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClinics(data);
        }
      })
      .catch((err) => console.error("Failed to fetch clinics", err));
  }, []);

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
        clinicId: data.clinicId,
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
    clinics,
    handleFakeUpload,
  };
}
