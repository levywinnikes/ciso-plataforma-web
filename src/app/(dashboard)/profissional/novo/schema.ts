import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { CareNucleus } from "@/features/referrals/types";

// Mensagens sao chaves i18n resolvidas pela view via useTranslations().
export const novoEncaminhamentoSchema = z.object({
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
  clinicalSuspect: z.string().min(1, "errors.clinicalSuspectRequired"),
  nucleusId: z.string().min(1, "errors.nucleusRequired"),
  clinicId: z.string().min(1, "errors.clinicRequired"),
});

export type NovoEncaminhamentoFormData = z.infer<
  typeof novoEncaminhamentoSchema
>;

export interface UploadedDocument {
  id: string;
  name: string;
}

export interface ClinicOption {
  id: string;
  name: string;
}

export interface NovoEncaminhamentoPageModel {
  form: UseFormReturn<NovoEncaminhamentoFormData>;
  onSubmit: (event: React.BaseSyntheticEvent) => void;
  documents: UploadedDocument[];
  selectedNucleus?: CareNucleus;
  clinics: ClinicOption[];
  handleFakeUpload: () => void;
  isSubmitting: boolean;
}
