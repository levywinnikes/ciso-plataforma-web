import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { birthDateSchema } from "@/features/referrals/birth-date";
import {
  createStatusField,
  withBlockJustification,
} from "@/features/referrals/block-status-schema";
import type { CareNucleus } from "@/features/referrals/types";

// Mensagens sao chaves i18n resolvidas pela view via useTranslations().
export const adminNovoEncaminhamentoSchema = withBlockJustification({
  patientName: z.string().min(1, "errors.patientNameRequired"),
  patientBirthDate: birthDateSchema,
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
  officeId: z.string().min(1, "errors.required"),
  createdByUserId: z.string().min(1, "errors.required"),
  status: createStatusField,
  justificativaBloqueio: z.string().optional(),
});

export type AdminNovoEncaminhamentoFormData = z.infer<
  typeof adminNovoEncaminhamentoSchema
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

export interface OfficeOption {
  id: string;
  name: string;
}

export interface ProfessionalOption {
  id: string;
  name: string;
}

export interface AdminNovoEncaminhamentoPageModel {
  form: UseFormReturn<AdminNovoEncaminhamentoFormData>;
  onSubmit: (event: React.BaseSyntheticEvent) => void;
  documents: UploadedDocument[];
  selectedNucleus?: CareNucleus;
  clinics: ClinicOption[];
  nuclei: CareNucleus[];
  offices: OfficeOption[];
  professionals: ProfessionalOption[];
  handleUploadFiles: (files: File[]) => Promise<void>;
  handleRemoveDocument: (id: string) => void;
  isUploading: boolean;
  isSubmitting: boolean;
}
