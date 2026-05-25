import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { CareNucleus, NucleusService } from "@/features/referrals/types";

// Mensagens sao chaves i18n resolvidas pela view via useTranslations().
// Documentacao: docs/ai/patterns.md (secao 2 e 4) e docs/ai/i18n-forms.md.
export const serviceSchema = z.object({
  name: z.string().min(1, "errors.nameRequired"),
  price: z
    .number({ message: "errors.priceInvalid" })
    .positive("errors.pricePositive"),
});

export const nucleusSchema = z.object({
  name: z.string().min(1, "errors.nameRequired"),
  description: z.string().min(1, "errors.descriptionRequired"),
  price: z
    .number({ message: "errors.priceInvalid" })
    .positive("errors.pricePositive"),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type NucleusFormData = z.infer<typeof nucleusSchema>;

export interface ManagedServiceRow {
  id: string;
  name: string;
  basePrice: number;
  nucleusId: string;
  nucleusName: string;
}

export interface AdminPageModel {
  nuclei: CareNucleus[];
  isLoading: boolean;
  services: NucleusService[];
  filteredServices: NucleusService[];
  isNucleusModalOpen: boolean;
  isEditNucleusModalOpen: boolean;
  selectedServices: NucleusService[];
  selectedServicesFullPrice: number;
  selectedServiceIds: string[];
  serviceSearchTerm: string;
  nucleusForm: UseFormReturn<NucleusFormData>;
  nucleusEditForm: UseFormReturn<NucleusFormData>;
  setIsNucleusModalOpen: (isOpen: boolean) => void;
  setIsEditNucleusModalOpen: (isOpen: boolean) => void;
  setServiceSearchTerm: (value: string) => void;
  toggleService: (serviceId: string) => void;
  openEditNucleusModal: (nucleusId: string) => void;
  deleteNucleus: (nucleusId: string) => Promise<void>;
  onUpdateNucleus: (event: React.BaseSyntheticEvent) => void;
  onCreateNucleus: (event: React.BaseSyntheticEvent) => void;
}
