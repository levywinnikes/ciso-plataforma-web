import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { Referral } from "@/features/referrals/types";

export const DOCTORS = [
  "Dr. Fernando Silva",
  "Dra. Aline Mendes",
  "Dr. Roberto Almeida",
] as const;

export const scheduleSchema = z.object({
  doctor: z.string().min(1, "Médico é obrigatório"),
  scheduleDate: z.string().min(1, "Data é obrigatória"),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export interface ClinicaPageModel {
  selectedReferral: Referral | null;
  referrals: Referral[];
  pendingReferralsCount: number;
  agendadosCount: number;
  atendidosCount: number;
  scheduleForm: UseFormReturn<ScheduleFormData>;
  setSelectedReferral: (referral: Referral | null) => void;
  handleOpenTriage: (referral: Referral) => void;
  onSaveSchedule: (event: React.BaseSyntheticEvent) => void;
}
