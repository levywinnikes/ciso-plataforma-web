import type { CareNucleus, Referral } from "@/features/referrals/types";

export interface NucleusRevenueRow {
  nucleus: CareNucleus;
  count: number;
  revenue: number;
}

export interface FinanceiroPageModel {
  referrals: Referral[];
  nuclei: CareNucleus[];
  totalReceita: number;
  encaminhadosCount: number;
  agendadosCount: number;
  atendidosCount: number;
  revenueRows: NucleusRevenueRow[];
}
