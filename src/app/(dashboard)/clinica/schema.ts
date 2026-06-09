import type { Referral } from "@/features/referrals/types";

export interface ClinicaPageModel {
  referrals: Referral[];
  agendadosCount: number;
  atendidosCount: number;
}
