/** Local calendar date helpers for financeiro period presets (YYYY-MM-DD). */

export type PeriodPreset = "today" | "thisMonth" | "lastMonth" | "last30";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toLocalISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

export function endOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function parseLocalISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function rangeForPreset(
  preset: PeriodPreset,
  now = new Date(),
): { startDate: string; endDate: string } {
  if (preset === "today") {
    const iso = toLocalISODate(now);
    return { startDate: iso, endDate: iso };
  }
  if (preset === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: toLocalISODate(start), endDate: toLocalISODate(end) };
  }
  if (preset === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: toLocalISODate(start), endDate: toLocalISODate(end) };
  }
  const end = startOfLocalDay(now);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  return { startDate: toLocalISODate(start), endDate: toLocalISODate(end) };
}

export function defaultPeriodRange(now = new Date()) {
  return rangeForPreset("thisMonth", now);
}

export function isDateInRange(
  date: Date,
  startDate: string,
  endDate: string,
): boolean {
  const t = date.getTime();
  return (
    t >= startOfLocalDay(parseLocalISODate(startDate)).getTime() &&
    t <= endOfLocalDay(parseLocalISODate(endDate)).getTime()
  );
}
