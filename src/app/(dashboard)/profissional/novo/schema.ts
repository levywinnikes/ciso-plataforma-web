import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { CareNucleus } from "@/features/referrals/types";

export const novoEncaminhamentoSchema = z.object({
  patientName: z.string().min(1, "Nome é obrigatório"),
  patientBirthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(
      (date) => /^\d{2}\/\d{2}\/\d{4}$/.test(date),
      "Data deve estar no formato DD/MM/YYYY",
    ),
  patientPhone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .transform((phone) => phone.replace(/\D/g, ""))
    .refine(
      (phone) => phone.length >= 10,
      "Telefone deve ter pelo menos 10 dígitos",
    ),
  patientDocument: z.string().optional(),
  systemicDiseases: z.string().optional(),
  clinicalNotes: z.string().optional(),
  clinicalSuspect: z.string().min(1, "Suspeita clínica é obrigatória"),
  nucleusId: z.string().min(1, "Selecione um núcleo de atendimento"),
});

export type NovoEncaminhamentoFormData = z.infer<
  typeof novoEncaminhamentoSchema
>;

export interface UploadedDocument {
  id: string;
  name: string;
}

export interface NovoEncaminhamentoPageModel {
  form: UseFormReturn<NovoEncaminhamentoFormData>;
  onSubmit: (event: React.BaseSyntheticEvent) => void;
  documents: UploadedDocument[];
  selectedNucleus?: CareNucleus;
  handleFakeUpload: () => void;
}
