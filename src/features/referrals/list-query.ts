import { startOfLocalDay } from "./overdue";
import type { ReferralStatus } from "./types";

export type ReferralListTabFilter = "active" | "blocked" | "overdue";

export type ReferralCounts = {
  encaminhado: number;
  agendado: number;
  atendido: number;
  bloqueado: number;
  overdue: number;
  active: number;
};

const REFERRAL_INCLUDE = {
  nucleus: { select: { name: true } },
  clinic: { select: { name: true } },
  office: { select: { name: true } },
  createdByUser: { select: { name: true, email: true } },
  documents: true,
  specialistFiles: true,
  agreement: { select: { name: true } },
  surgery: { select: { name: true } },
} as const;

export function referralListInclude() {
  return REFERRAL_INCLUDE;
}

export function parsePageParams(searchParams: URLSearchParams): {
  page: number | null;
  pageSize: number;
} {
  const rawPage = searchParams.get("page");
  if (rawPage === null || rawPage === "") {
    return { page: null, pageSize: 10 };
  }
  const page = Math.max(1, Number.parseInt(rawPage, 10) || 1);
  const rawSize = Number.parseInt(searchParams.get("pageSize") ?? "10", 10);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.isFinite(rawSize) ? rawSize : 10),
  );
  return { page, pageSize };
}

export function applyTabFilter(
  where: Record<string, unknown>,
  tab: string | null,
  now = new Date(),
): Record<string, unknown> {
  if (tab === "blocked") {
    return { ...where, status: "Bloqueado" };
  }
  if (tab === "overdue") {
    return {
      ...where,
      status: { not: "Atendido" },
      appointmentDate: {
        not: null,
        lt: startOfLocalDay(now),
      },
    };
  }
  if (tab === "active") {
    return {
      ...where,
      status: { not: "Bloqueado" },
    };
  }
  return where;
}

export function applyStatusFilter(
  where: Record<string, unknown>,
  status: string | null,
): Record<string, unknown> {
  if (!status) return where;
  const allowed: ReferralStatus[] = [
    "Bloqueado",
    "Encaminhado",
    "Agendado",
    "Atendido",
  ];
  if (!allowed.includes(status as ReferralStatus)) return where;
  return { ...where, status };
}

export function applyAppointmentRange(
  where: Record<string, unknown>,
  appointmentFrom: string | null,
  appointmentTo: string | null,
): Record<string, unknown> {
  if (!appointmentFrom && !appointmentTo) return where;
  const appointmentDate: Record<string, unknown> = { not: null };
  if (appointmentFrom) {
    appointmentDate.gte = new Date(`${appointmentFrom}T00:00:00`);
  }
  if (appointmentTo) {
    appointmentDate.lte = new Date(`${appointmentTo}T23:59:59.999`);
  }
  return { ...where, appointmentDate };
}

export function emptyCounts(): ReferralCounts {
  return {
    encaminhado: 0,
    agendado: 0,
    atendido: 0,
    bloqueado: 0,
    overdue: 0,
    active: 0,
  };
}
