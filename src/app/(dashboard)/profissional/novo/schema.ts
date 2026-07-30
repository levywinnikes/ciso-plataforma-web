import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  createStatusField,
  withBlockJustification,
} from "@/features/referrals/block-status-schema";
import type { CareNucleus } from "@/features/referrals/types";

// Mensagens sao chaves i18n resolvidas pela view via useTranslations().
export const novoEncaminhamentoSchema = withBlockJustification({
  patientName: z.string().min(1, "errors.patientNameRequired"),
  patientBirthDate: z
    .string()
    .min(1, "errors.birthDateRequired")
    .refine(
      (date) => /^\d{4}-\d{2}-\d{2}$/.test(date),
      "errors.birthDateInvalid",
    ),
  patientPhone: z
    .string()
    .min(1, "errors.phoneRequired")
    .transform((phone) => phone.replace(/\D/g, ""))
    .refine((phone) => phone.length >= 10, "errors.phoneMinDigits"),
  patientDocument: z.string().optional(),
  systemicDiseases: z.string().optional(),
  clinicalNotes: z.string().optional(),
  nucleusId: z.string().min(1, "errors.nucleusRequired"),
  clinicId: z.string().min(1, "errors.clinicRequired"),
  agreementId: z.string().optional(),
  status: createStatusField,
  justificativaBloqueio: z.string().optional(),
});

export type NovoEncaminhamentoFormData = z.infer<
  typeof novoEncaminhamentoSchema
>;

export interface UploadedDocument {
  id: string;
  name: string;
  url?: string;
  key?: string;
  uploadedAt?: string;
}

export interface ClinicOption {
  id: string;
  name: string;
  agreements?: Array<{
    agreement: {
      id: string;
      name: string;
    };
  }>;
}

export interface NovoEncaminhamentoPageModel {
  form: UseFormReturn<NovoEncaminhamentoFormData>;
  onSubmit: (event: React.BaseSyntheticEvent) => void;
  documents: UploadedDocument[];
  selectedNucleus?: CareNucleus;
  clinics: ClinicOption[];
  nuclei: CareNucleus[];
  handleUploadFiles: (files: File[]) => Promise<void>;
  handleRemoveDocument: (id: string) => void;
  isUploading: boolean;
  isSubmitting: boolean;
}
