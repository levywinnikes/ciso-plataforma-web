import type { ReferralStatus } from "@/features/referrals/types";

import { isDateInRange } from "./period";

export type FinanceiroReferralRow = {
  id: string;
  patientName: string;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  officeId: string;
  officeName: string;
  clinicName: string;
  nucleusId: string;
  nucleusName: string;
  nucleusPrice: number;
  surgeryId: string | null;
  surgeryName: string | null;
  surgeryPrice: number | null;
  doctor: string | null;
};

export type FinanceiroFilters = {
  startDate: string;
  endDate: string;
  officeId?: string;
  onlyAttended?: boolean;
  onlyWithSurgery?: boolean;
};

export function referenceDateForPeriod(row: FinanceiroReferralRow): Date {
  if (row.status === "Atendido") {
    return row.completedAt ?? row.updatedAt;
  }
  return row.createdAt;
}

export function nucleusCommission(row: FinanceiroReferralRow): number {
  return Number.isFinite(row.nucleusPrice) ? row.nucleusPrice : 0;
}

export function surgeryCommission(row: FinanceiroReferralRow): number {
  if (!row.surgeryId) return 0;
  const value = row.surgeryPrice ?? 0;
  return Number.isFinite(value) ? value : 0;
}

export function matchesFinanceiroFilters(
  row: FinanceiroReferralRow,
  filters: FinanceiroFilters,
): boolean {
  if (row.status === "Bloqueado") return false;
  if (filters.officeId && row.officeId !== filters.officeId) return false;
  if (filters.onlyAttended && row.status !== "Atendido") return false;
  if (filters.onlyWithSurgery && !row.surgeryId) return false;
  return isDateInRange(
    referenceDateForPeriod(row),
    filters.startDate,
    filters.endDate,
  );
}

export function aggregateFinanceiro(
  rows: FinanceiroReferralRow[],
  filters: FinanceiroFilters,
) {
  const filtered = rows.filter((row) => matchesFinanceiroFilters(row, filters));
  const billable = filtered.filter((row) => row.status === "Atendido");

  let commissionNucleus = 0;
  let commissionSurgery = 0;
  for (const row of billable) {
    commissionNucleus += nucleusCommission(row);
    commissionSurgery += surgeryCommission(row);
  }

  const byStatus: Record<string, number> = {
    Encaminhado: 0,
    Agendado: 0,
    Atendido: 0,
  };
  for (const row of filtered) {
    if (row.status in byStatus) byStatus[row.status] += 1;
  }

  const nucleusMap = new Map<
    string,
    { id: string; name: string; count: number; commission: number }
  >();
  const surgeryMap = new Map<
    string,
    { id: string; name: string; count: number; commission: number }
  >();

  for (const row of filtered) {
    const n = nucleusMap.get(row.nucleusId) ?? {
      id: row.nucleusId,
      name: row.nucleusName,
      count: 0,
      commission: 0,
    };
    n.count += 1;
    if (row.status === "Atendido") n.commission += nucleusCommission(row);
    nucleusMap.set(row.nucleusId, n);

    if (row.surgeryId) {
      const s = surgeryMap.get(row.surgeryId) ?? {
        id: row.surgeryId,
        name: row.surgeryName ?? row.surgeryId,
        count: 0,
        commission: 0,
      };
      s.count += 1;
      if (row.status === "Atendido") s.commission += surgeryCommission(row);
      surgeryMap.set(row.surgeryId, s);
    }
  }

  const items = filtered
    .map((row) => {
      const ref = referenceDateForPeriod(row);
      return {
        id: row.id,
        patientName: row.patientName,
        status: row.status,
        referenceDate: ref.toISOString().slice(0, 10),
        officeName: row.officeName,
        clinicName: row.clinicName,
        nucleusName: row.nucleusName,
        nucleusCommission: nucleusCommission(row),
        surgeryName: row.surgeryName,
        surgeryCommission: surgeryCommission(row),
        doctor: row.doctor,
        billable: row.status === "Atendido",
      };
    })
    .sort((a, b) => b.referenceDate.localeCompare(a.referenceDate));

  return {
    summary: {
      encaminhado: byStatus.Encaminhado,
      agendado: byStatus.Agendado,
      atendido: byStatus.Atendido,
      withSurgery: filtered.filter((r) => Boolean(r.surgeryId)).length,
      commissionNucleus,
      commissionSurgery,
      commissionTotal: commissionNucleus + commissionSurgery,
      itemCount: filtered.length,
    },
    byNucleus: [...nucleusMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    bySurgery: [...surgeryMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    byStatus: [
      { status: "Encaminhado", count: byStatus.Encaminhado },
      { status: "Agendado", count: byStatus.Agendado },
      { status: "Atendido", count: byStatus.Atendido },
    ],
    items,
  };
}
