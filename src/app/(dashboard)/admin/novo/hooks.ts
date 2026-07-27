"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { CareNucleus } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";
import { uploadFilesToStorage } from "@/lib/upload-client";

import type {
  AdminNovoEncaminhamentoFormData,
  AdminNovoEncaminhamentoPageModel,
  ClinicOption,
  OfficeOption,
  ProfessionalOption,
  UploadedDocument,
} from "./schema";
import { adminNovoEncaminhamentoSchema } from "./schema";

export function useAdminNovoEncaminhamentoPageModel(): AdminNovoEncaminhamentoPageModel {
  const router = useRouter();
  const toast = useAppToast();
  const tError = useFormError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<AdminNovoEncaminhamentoFormData>({
    resolver: zodResolver(adminNovoEncaminhamentoSchema),
    defaultValues: {
      patientName: "",
      patientBirthDate: "",
      patientPhone: "",
      patientDocument: "",
      systemicDiseases: "",
      clinicalNotes: "",
      nucleusId: "",
      clinicId: "",
      agreementId: "",
      officeId: "",
      createdByUserId: "",
    },
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [nuclei, setNuclei] = useState<CareNucleus[]>([]);
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);

  useEffect(() => {
    // Load clinics
    fetch("/api/referrals/clinics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClinics(data);
        }
      })
      .catch((err) => console.error("Failed to fetch clinics", err));

    // Load nuclei
    fetch("/api/nuclei")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNuclei(data);
        }
      })
      .catch((err) => console.error("Failed to fetch nuclei", err));

    // Load offices (groups of professionals)
    fetch("/api/organizations?type=PROFISSIONAL_GROUP")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOffices(data);
        }
      })
      .catch((err) => console.error("Failed to fetch offices", err));
  }, []);

  const officeId = form.watch("officeId");

  // Fetch professionals when officeId changes
  useEffect(() => {
    form.setValue("createdByUserId", "");
    if (!officeId) {
      setProfessionals([]);
      return;
    }

    fetch(`/api/users/organization?organizationId=${officeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter to only show users with role "PROFISSIONAL"
          const filtered = data.filter(
            (user: any) => user.role === "PROFISSIONAL",
          );
          setProfessionals(filtered);
        }
      })
      .catch((err) => console.error("Failed to fetch organization users", err));
  }, [officeId, form]);

  const nucleusId = form.watch("nucleusId");
  const selectedNucleus = nuclei.find((item) => item.id === nucleusId);

  const clinicId = form.watch("clinicId");
  useEffect(() => {
    form.setValue("agreementId", "");
  }, [clinicId, form]);

  const handleUploadFiles = async (files: File[]) => {
    setIsUploading(true);
    try {
      const uploaded = await uploadFilesToStorage(files);
      setDocuments((current) => [...current, ...uploaded]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "errors.uploadFailed";
      toast.error(tError(message) ?? "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((current) => current.filter((item) => item.id !== id));
  };

  const handleFormSubmit = async (data: AdminNovoEncaminhamentoFormData) => {
    if (!selectedNucleus) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: data.patientName,
          patientBirthDate: data.patientBirthDate,
          patientPhone: data.patientPhone,
          patientDocument: data.patientDocument || undefined,
          systemicDiseases: data.systemicDiseases || undefined,
          clinicalNotes: data.clinicalNotes || undefined,
          nucleusId: selectedNucleus.id,
          clinicId: data.clinicId,
          agreementId: data.agreementId || undefined,
          officeId: data.officeId,
          createdByUserId: data.createdByUserId,
          documents: documents.map((item) => ({
            id: item.id,
            name: item.name,
            url: item.key || item.url,
            uploadedAt: item.uploadedAt ?? new Date().toISOString(),
          })),
        }),
      });

      if (!response.ok) {
        toast.error(tError("errors.genericRequestFailed") ?? "");
        return;
      }

      toast.success("Encaminhamento salvo com sucesso!");
      router.push("/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(handleFormSubmit),
    documents,
    selectedNucleus,
    clinics,
    nuclei,
    offices,
    professionals,
    handleUploadFiles,
    handleRemoveDocument,
    isUploading,
    isSubmitting,
  };
}
