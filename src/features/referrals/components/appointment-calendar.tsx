"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, cn } from "@/components/ui";
import {
  buildMonthGridDays,
  type CalendarStatusFilter,
  civilDayKey,
  filterCalendarReferrals,
  formatMonthTitle,
  groupReferralsByCivilDay,
  isDayInMonth,
  isToday,
  monthBoundsIso,
  shiftMonth,
  weekdayLabels,
} from "@/features/referrals/appointment-calendar-utils";
import { fetchReferralsAll } from "@/features/referrals/fetch-referrals";
import {
  canAdminMarkAsAttended,
  isReferralOverdue,
} from "@/features/referrals/overdue";
import type { Referral, ReferralStatus } from "@/features/referrals/types";

const MAX_CHIPS = 4;

const STATUS_PILL: Record<ReferralStatus, string> = {
  Bloqueado: "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-200",
  Encaminhado: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200",
  Agendado: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200",
  Atendido: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
};

export type CalendarActionHandlers = {
  /** admin: sempre; profissional: Encaminhado/Bloqueado */
  onEdit?: (referral: Referral) => void;
  onDelete?: (referral: Referral) => void;
  /** admin: Encaminhado ou Agendado */
  onMarkAttended?: (referral: Referral) => void;
  /** admin: Encaminhado */
  onSchedule?: (referral: Referral) => void;
  /** profissional: visualizar */
  onView?: (referral: Referral) => void;
  /**
   * `admin` — mesmas regras da lista administrativa
   * `professional` — mesmas regras da lista do consultório
   */
  policy: "admin" | "professional";
};

function formatTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "HH:mm");
}

function formatDayHeading(dayKey: string, locale: string): string {
  if (!dayKey) return "";
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale.startsWith("en") ? "en-US" : "pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function canProfessionalEdit(status: ReferralStatus): boolean {
  return status === "Encaminhado" || status === "Bloqueado";
}

type Props = {
  onSelectReferral: (referral: Referral) => void;
  className?: string;
  /** Optional seed for tests; production loads via API by month. */
  initialReferrals?: Referral[];
  /** Bump to reload the visible month after mutations. */
  refreshKey?: number;
  actions?: CalendarActionHandlers;
};

export function AppointmentCalendar({
  onSelectReferral,
  className,
  initialReferrals,
  refreshKey = 0,
  actions,
}: Props) {
  const t = useTranslations("agenda");
  const common = useTranslations("common");
  const locale = useLocale();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => civilDayKey(new Date()));
  const [statusFilter, setStatusFilter] = useState<CalendarStatusFilter>("all");
  const [referrals, setReferrals] = useState<Referral[]>(
    initialReferrals ?? [],
  );
  const [isLoading, setIsLoading] = useState(!initialReferrals);

  const loadMonth = useCallback(async (target: Date) => {
    setIsLoading(true);
    try {
      const bounds = monthBoundsIso(target);
      const items = await fetchReferralsAll({
        appointmentFrom: bounds.appointmentFrom,
        appointmentTo: bounds.appointmentTo,
      });
      setReferrals(items);
    } catch {
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialReferrals) return;
    void loadMonth(month);
  }, [month, loadMonth, initialReferrals, refreshKey]);

  const filtered = useMemo(
    () => filterCalendarReferrals(referrals, statusFilter),
    [referrals, statusFilter],
  );
  const byDay = useMemo(() => groupReferralsByCivilDay(filtered), [filtered]);
  const days = useMemo(() => buildMonthGridDays(month), [month]);
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const dayItems = byDay.get(selectedDay) ?? [];

  const showActionLegend = Boolean(actions);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-primary">{t("title")}</h2>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm text-gray-700"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CalendarStatusFilter)
            }
            aria-label={t("filterStatus")}
          >
            <option value="all">{t("filterAll")}</option>
            <option value="Agendado">{t("filterScheduled")}</option>
            <option value="Atendido">{t("filterAttended")}</option>
            <option value="atrasados">{t("filterOverdue")}</option>
          </select>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-sm"
            onClick={() => {
              const now = new Date();
              setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              setSelectedDay(civilDayKey(now));
            }}
          >
            {t("today")}
          </Button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-2 text-primary hover:bg-primary/5"
              aria-label={t("prevMonth")}
              onClick={() => {
                setMonth((current) => {
                  const next = shiftMonth(current, -1);
                  setSelectedDay(civilDayKey(next));
                  return next;
                });
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[11rem] text-center text-base font-medium capitalize text-gray-800">
              {formatMonthTitle(month, locale)}
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-primary hover:bg-primary/5"
              aria-label={t("nextMonth")}
              onClick={() => {
                setMonth((current) => {
                  const next = shiftMonth(current, 1);
                  setSelectedDay(civilDayKey(next));
                  return next;
                });
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-primary/10 bg-white px-5 py-2.5 text-[11px] text-gray-600">
        {showActionLegend ? (
          <>
            <span className="font-semibold uppercase tracking-wide text-gray-400">
              {t("legendActions")}
            </span>
            {actions?.policy === "admin" && actions.onMarkAttended ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                {t("legendMarkAttended")}
              </span>
            ) : null}
            {actions?.policy === "admin" && actions.onSchedule ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {t("legendSchedule")}
              </span>
            ) : null}
            {actions?.onView ? (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-emerald-700" />
                {t("legendView")}
              </span>
            ) : null}
            {actions?.onEdit ? (
              <span className="inline-flex items-center gap-1">
                <Pencil className="h-3.5 w-3.5 text-amber-600" />
                {t("legendEdit")}
              </span>
            ) : null}
            {actions?.onDelete ? (
              <span className="inline-flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                {t("legendDelete")}
              </span>
            ) : null}
            <span className="text-gray-400">·</span>
          </>
        ) : null}
        <span className="font-semibold uppercase tracking-wide text-gray-400">
          {t("legendStatus")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          {t("filterScheduled")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {t("filterAttended")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          {t("filterOverdue")}
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
        <div className="relative p-4 sm:p-5">
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[1px]">
              <p className="rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
                {t("loading")}
              </p>
            </div>
          ) : null}
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {weekdays.map((label) => (
              <div
                key={label}
                className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const key = civilDayKey(day);
              const items = byDay.get(key) ?? [];
              const inMonth = isDayInMonth(day, month);
              const selected = key === selectedDay;
              const today = isToday(day);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  className={cn(
                    "flex min-h-[6.5rem] flex-col rounded-xl border p-2 text-left transition sm:min-h-[7.5rem]",
                    inMonth
                      ? "border-primary/10 bg-white"
                      : "border-transparent bg-gray-50/80 text-gray-400",
                    selected && "border-primary/40 ring-2 ring-primary/35",
                    today && !selected && "border-emerald-300/80",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        today ? "text-primary" : "text-gray-700",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {items.length > 0 ? (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {items.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-auto space-y-1">
                    {items.slice(0, MAX_CHIPS).map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "truncate rounded-md px-1.5 py-0.5 text-[10px] leading-4",
                          isReferralOverdue(item)
                            ? "bg-rose-100 text-rose-800"
                            : item.status === "Atendido"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-sky-100 text-sky-800",
                        )}
                        title={`${item.appointmentDate ? formatTime(item.appointmentDate) : ""} ${item.patientName}`}
                      >
                        <span className="font-semibold tabular-nums">
                          {item.appointmentDate
                            ? formatTime(item.appointmentDate)
                            : "—"}
                        </span>{" "}
                        {item.patientName}
                      </div>
                    ))}
                    {items.length > MAX_CHIPS ? (
                      <span className="text-[10px] text-gray-500">
                        +{items.length - MAX_CHIPS}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="flex min-h-[28rem] flex-col border-t border-primary/10 bg-emerald-50/40 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t("dayPanel")}
          </h3>
          <p className="mt-1 text-base font-medium capitalize text-gray-800">
            {selectedDay ? formatDayHeading(selectedDay, locale) : t("pickDay")}
          </p>
          <p className="text-xs text-gray-500">{t("dayScheduleHint")}</p>

          <ul className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
            {dayItems.length === 0 ? (
              <li className="rounded-xl border border-dashed border-primary/20 bg-white px-3 py-8 text-center text-sm text-gray-500">
                {t("emptyDay")}
              </li>
            ) : (
              dayItems.map((item) => {
                const professionalEditable = canProfessionalEdit(item.status);
                return (
                  <li key={item.id}>
                    <div
                      className={cn(
                        "overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm",
                        isReferralOverdue(item) &&
                          "border-rose-200 bg-rose-50/40",
                      )}
                    >
                      <button
                        type="button"
                        className="flex w-full gap-3 p-3 text-left transition hover:bg-primary/[0.02]"
                        onClick={() => onSelectReferral(item)}
                      >
                        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/5 px-1 py-2">
                          <span className="text-base font-bold tabular-nums text-primary">
                            {item.appointmentDate
                              ? formatTime(item.appointmentDate)
                              : "—"}
                          </span>
                          <span className="text-[10px] uppercase text-gray-500">
                            {t("timeLabel")}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {item.patientName}
                            </p>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <span
                                className={cn(
                                  "whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  STATUS_PILL[item.status],
                                )}
                              >
                                {item.status}
                              </span>
                              {isReferralOverdue(item) ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-800">
                                  <Clock className="h-3 w-3" />
                                  {t("overdueSeal")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-600">
                            {item.nucleusName}
                          </p>
                          {item.doctor ? (
                            <p className="truncate text-xs text-gray-500">
                              {item.doctor}
                            </p>
                          ) : null}
                          {item.clinicalNotes?.trim() ? (
                            <p
                              className="mt-1.5 line-clamp-2 text-xs leading-snug text-gray-600"
                              title={item.clinicalNotes.trim()}
                            >
                              <span className="font-medium text-gray-500">
                                {t("clinicalNotesLabel")}:{" "}
                              </span>
                              {item.clinicalNotes.trim()}
                            </p>
                          ) : null}
                        </div>
                      </button>

                      {actions ? (
                        <div className="flex items-center justify-end gap-0.5 border-t border-primary/5 px-2 py-1.5">
                          {actions.policy === "admin" &&
                          actions.onMarkAttended &&
                          canAdminMarkAsAttended(item.status) ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-50"
                              title={t("legendMarkAttended")}
                              aria-label={t("legendMarkAttended")}
                              onClick={() => actions.onMarkAttended?.(item)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          ) : null}

                          {actions.policy === "admin" &&
                          actions.onSchedule &&
                          item.status === "Encaminhado" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-primary hover:bg-primary/5"
                              title={t("legendSchedule")}
                              aria-label={t("legendSchedule")}
                              onClick={() => actions.onSchedule?.(item)}
                            >
                              <CalendarDays className="h-4 w-4" />
                            </Button>
                          ) : null}

                          {actions.onView ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title={t("legendView")}
                              aria-label={t("legendView")}
                              onClick={() => actions.onView?.(item)}
                            >
                              <Eye className="h-4 w-4 text-emerald-700" />
                            </Button>
                          ) : null}

                          {actions.onEdit ? (
                            actions.policy === "professional" &&
                            !professionalEditable ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-8 cursor-not-allowed p-0 opacity-50"
                                disabled
                                title={t("legendEditLocked")}
                                aria-label={t("legendEditLocked")}
                              >
                                <Pencil className="h-4 w-4 text-gray-400" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title={common("edit")}
                                aria-label={common("edit")}
                                onClick={() => actions.onEdit?.(item)}
                              >
                                <Pencil className="h-4 w-4 text-amber-600" />
                              </Button>
                            )
                          ) : null}

                          {actions.onDelete ? (
                            actions.policy === "admin" &&
                            item.status ===
                              "Atendido" ? null : actions.policy ===
                                "professional" &&
                              !professionalEditable ? null : (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title={common("delete")}
                                aria-label={common("delete")}
                                onClick={() => actions.onDelete?.(item)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}
