import { startOfLocalDay } from "./overdue";
import type { ReferralStatus } from "./types";

export type ReferralListTabFilter =
  | "active"
  | "blocked"
  | "overdue"
  | "pending"
  | "scheduled"
  | "attended";

export type ReferralSortField =
  | "patientName"
  | "status"
  | "office"
  | "createdBy"
  | "clinic"
  | "doctor"
  | "appointmentDate"
  | "createdAt";

export type ReferralSortDir = "asc" | "desc";

export type ReferralCounts = {
  encaminhado: number;
  agendado: number;
  atendido: number;
  bloqueado: number;
  overdue: number;
  active: number;
};

export type ReferralColumnFilters = {
  patient?: string;
  office?: string;
  clinic?: string;
  doctor?: string;
  createdBy?: string;
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

const SORT_FIELDS: ReferralSortField[] = [
  "patientName",
  "status",
  "office",
  "createdBy",
  "clinic",
  "doctor",
  "appointmentDate",
  "createdAt",
];

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

export function parseSortParams(searchParams: URLSearchParams): {
  sortBy: ReferralSortField;
  sortDir: ReferralSortDir;
} {
  const raw = searchParams.get("sortBy") as ReferralSortField | null;
  const sortBy = raw && SORT_FIELDS.includes(raw) ? raw : "createdAt";
  const rawDir = searchParams.get("sortDir");
  const sortDir: ReferralSortDir =
    rawDir === "asc" || rawDir === "desc"
      ? rawDir
      : sortBy === "createdAt"
        ? "desc"
        : "asc";
  return { sortBy, sortDir };
}

export function parseColumnFilters(
  searchParams: URLSearchParams,
): ReferralColumnFilters {
  const pick = (key: string) => {
    const value = searchParams.get(key)?.trim();
    return value ? value : undefined;
  };
  return {
    patient: pick("patient"),
    office: pick("office"),
    clinic: pick("clinic"),
    doctor: pick("doctor"),
    createdBy: pick("createdBy"),
  };
}

export function applyTabFilter(
  where: Record<string, unknown>,
  tab: string | null,
  now = new Date(),
): Record<string, unknown> {
  if (tab === "blocked") {
    return { ...where, status: "Bloqueado" };
  }
  if (tab === "pending") {
    return { ...where, status: "Encaminhado" };
  }
  if (tab === "scheduled") {
    return { ...where, status: "Agendado" };
  }
  if (tab === "attended") {
    return { ...where, status: "Atendido" };
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

export function applyColumnFilters(
  where: Record<string, unknown>,
  filters: ReferralColumnFilters,
): Record<string, unknown> {
  const next = { ...where };
  const and: Record<string, unknown>[] = Array.isArray(next.AND)
    ? [...(next.AND as Record<string, unknown>[])]
    : [];

  if (filters.patient) {
    and.push({
      patientName: { contains: filters.patient, mode: "insensitive" },
    });
  }
  if (filters.office) {
    and.push({
      office: { name: { contains: filters.office, mode: "insensitive" } },
    });
  }
  if (filters.clinic) {
    and.push({
      clinic: { name: { contains: filters.clinic, mode: "insensitive" } },
    });
  }
  if (filters.doctor) {
    and.push({
      doctor: { contains: filters.doctor, mode: "insensitive" },
    });
  }
  if (filters.createdBy) {
    and.push({
      createdByUser: {
        name: { contains: filters.createdBy, mode: "insensitive" },
      },
    });
  }

  if (and.length === 0) return next;
  return { ...next, AND: and };
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

export function buildReferralOrderBy(
  sortBy: ReferralSortField,
  sortDir: ReferralSortDir,
): Record<string, unknown>[] {
  const dir = sortDir;
  switch (sortBy) {
    case "patientName":
      return [{ patientName: dir }, { createdAt: "desc" }];
    case "status":
      return [{ status: dir }, { appointmentDate: "asc" }];
    case "office":
      return [{ office: { name: dir } }, { createdAt: "desc" }];
    case "createdBy":
      return [{ createdByUser: { name: dir } }, { createdAt: "desc" }];
    case "clinic":
      return [{ clinic: { name: dir } }, { createdAt: "desc" }];
    case "doctor":
      return [{ doctor: dir }, { createdAt: "desc" }];
    case "createdAt":
      return [{ createdAt: dir }];
    case "appointmentDate":
    default:
      return [{ appointmentDate: dir }, { createdAt: "desc" }];
  }
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
