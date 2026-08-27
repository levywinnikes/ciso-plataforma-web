import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

import { isReferralOverdue, startOfLocalDay } from "./overdue";
import type { Referral } from "./types";

/** Chave de dia civil local: AAAA-MM-DD */
export function civilDayKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const local = startOfLocalDay(date);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const d = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function referralsWithAppointment(referrals: Referral[]): Referral[] {
  return referrals.filter((item) => Boolean(item.appointmentDate));
}

export function groupReferralsByCivilDay(
  referrals: Referral[],
): Map<string, Referral[]> {
  const map = new Map<string, Referral[]>();
  for (const item of referralsWithAppointment(referrals)) {
    const key = civilDayKey(item.appointmentDate!);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => {
      const ta = new Date(a.appointmentDate!).getTime();
      const tb = new Date(b.appointmentDate!).getTime();
      return ta - tb;
    });
  }
  return map;
}

export function buildMonthGridDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function monthBoundsIso(month: Date): {
  appointmentFrom: string;
  appointmentTo: string;
} {
  // Mesmo intervalo da grade (inclui dias cinza do mês anterior/próximo).
  const from = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const to = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return {
    appointmentFrom: civilDayKey(from),
    appointmentTo: civilDayKey(to),
  };
}

export function shiftMonth(month: Date, delta: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

export function formatMonthTitle(month: Date, locale: string): string {
  const loc = locale.startsWith("en") ? enUS : ptBR;
  return format(month, "MMMM yyyy", { locale: loc });
}

export function isDayInMonth(day: Date, month: Date): boolean {
  return isSameMonth(day, month);
}

export function isToday(day: Date, now = new Date()): boolean {
  return isSameDay(day, now);
}

export type CalendarStatusFilter =
  | "all"
  | "Agendado"
  | "Atendido"
  | "atrasados";

export function filterCalendarReferrals(
  referrals: Referral[],
  statusFilter: CalendarStatusFilter,
  now = new Date(),
): Referral[] {
  const withDate = referralsWithAppointment(referrals);
  if (statusFilter === "all") return withDate;
  if (statusFilter === "atrasados") {
    return withDate.filter((item) => isReferralOverdue(item, now));
  }
  return withDate.filter((item) => item.status === statusFilter);
}

export function weekdayLabels(locale: string): string[] {
  const loc = locale.startsWith("en") ? enUS : ptBR;
  const base = startOfWeek(new Date(), { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(base, i), "EEEEEE", { locale: loc }),
  );
}
