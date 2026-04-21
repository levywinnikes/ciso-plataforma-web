import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { CareNucleus, NucleusService } from "@/features/referrals/types";

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z
    .number({ message: "Insira um valor válido" })
    .positive("Valor deve ser maior que zero"),
});

export const nucleusSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z
    .number({ message: "Insira um valor válido" })
    .positive("Valor deve ser maior que zero"),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type NucleusFormData = z.infer<typeof nucleusSchema>;

export interface AdminPageModel {
  nuclei: CareNucleus[];
  services: NucleusService[];
  isNucleusModalOpen: boolean;
  selectedServices: NucleusService[];
  selectedServicesFullPrice: number;
  selectedServiceIds: string[];
  serviceForm: UseFormReturn<ServiceFormData>;
  nucleusForm: UseFormReturn<NucleusFormData>;
  setIsNucleusModalOpen: (isOpen: boolean) => void;
  toggleService: (serviceId: string) => void;
  onCreateService: (event: React.BaseSyntheticEvent) => void;
  onCreateNucleus: (event: React.BaseSyntheticEvent) => void;
}
