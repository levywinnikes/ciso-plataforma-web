"use client";

import { useTranslations } from "next-intl";

import {
  Button,
  OverlayLoader,
  PageHeader,
  Skeleton,
  StatCard,
  TableCard,
  TableShell,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/features/referrals/utils";

import type { FinanceiroPageModel, PeriodPreset } from "./schema";

interface FinanceiroPageViewProps {
  model: FinanceiroPageModel;
}

const PRESETS: PeriodPreset[] = ["today", "thisMonth", "lastMonth", "last30"];

function statusLabel(status: string, t: (key: string) => string) {
  if (status === "Encaminhado") return t("statusEncaminhado");
  if (status === "Agendado") return t("statusAgendado");
  return t("statusAtendido");
}

export function FinanceiroPageView({ model }: FinanceiroPageViewProps) {
  const t = useTranslations("financial");
  const summary = model.data?.summary;
  const offices = model.data?.offices ?? [];
  const isInitialLoad = model.loading && !summary;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold uppercase text-gray-700">
              {t("periodLabel")}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="date"
                className="ui-field w-full"
                value={model.draftStartDate}
                disabled={model.loading}
                onChange={(e) => model.setDraftStartDate(e.target.value)}
              />
              <input
                type="date"
                className="ui-field w-full"
                value={model.draftEndDate}
                disabled={model.loading}
                onChange={(e) => model.setDraftEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold uppercase text-gray-700">
              {t("officeLabel")}
            </label>
            <select
              className="ui-field w-full"
              value={model.draftOfficeId}
              disabled={model.loading}
              onChange={(e) => model.setDraftOfficeId(e.target.value)}
            >
              <option value="">{t("allOffices")}</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={model.loading}
              onClick={model.clearFilters}
            >
              {t("clearFilters")}
            </Button>
            <Button
              type="button"
              isLoading={model.loading}
              onClick={model.search}
            >
              {t("search")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const active = model.activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                disabled={model.loading}
                onClick={() => model.applyPreset(preset)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary/40"
                }`}
              >
                {t(`presets.${preset}`)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={model.draftOnlyAttended}
              disabled={model.loading}
              onChange={(e) => model.setDraftOnlyAttended(e.target.checked)}
            />
            {t("onlyAttended")}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={model.draftOnlyWithSurgery}
              disabled={model.loading}
              onChange={(e) => model.setDraftOnlyWithSurgery(e.target.checked)}
            />
            {t("onlyWithSurgery")}
          </label>
        </div>
      </div>

      {model.error ? (
        <p className="text-sm text-red-600">{t("loadError")}</p>
      ) : null}

      <div className="relative min-h-[12rem] space-y-6">
        {model.loading && summary ? (
          <OverlayLoader message={t("loadingMessage")} />
        ) : null}

        {isInitialLoad ? (
          <>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </>
        ) : (
          <>
            <div
              className={`grid gap-4 md:grid-cols-3 lg:grid-cols-5 ${
                model.loading ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <StatCard
                label={t("toChargeNucleus")}
                value={formatCurrency(summary?.commissionNucleus ?? 0)}
                valueClassName="text-2xl font-bold text-primary"
              />
              <StatCard
                label={t("toChargeSurgery")}
                value={formatCurrency(summary?.commissionSurgery ?? 0)}
                valueClassName="text-2xl font-bold text-primary"
              />
              <StatCard
                label={t("toChargeTotal")}
                value={formatCurrency(summary?.commissionTotal ?? 0)}
                valueClassName="text-2xl font-bold text-emerald-700"
              />
              <StatCard
                label={t("statusAtendido")}
                value={summary?.atendido ?? 0}
              />
              <StatCard
                label={t("withSurgeryCount")}
                value={summary?.withSurgery ?? 0}
              />
            </div>

            <div
              className={`grid gap-4 lg:grid-cols-3 ${
                model.loading ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <TableCard title={t("byNucleus")}>
                <TableShell
                  columns={
                    <tr>
                      <th className="px-4 py-3">{t("nucleus")}</th>
                      <th className="px-4 py-3">{t("quantity")}</th>
                      <th className="px-4 py-3">{t("toCharge")}</th>
                    </tr>
                  }
                >
                  {(model.data?.byNucleus ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="ui-table-cell text-center text-gray-500"
                      >
                        {t("emptyNucleus")}
                      </td>
                    </tr>
                  ) : (
                    model.data?.byNucleus.map((row) => (
                      <tr key={row.id} className="ui-table-row">
                        <td className="ui-table-cell font-medium">
                          {row.name}
                        </td>
                        <td className="ui-table-cell">{row.count}</td>
                        <td className="ui-table-cell font-semibold text-primary">
                          {formatCurrency(row.commission)}
                        </td>
                      </tr>
                    ))
                  )}
                </TableShell>
              </TableCard>

              <TableCard title={t("bySurgery")}>
                <TableShell
                  columns={
                    <tr>
                      <th className="px-4 py-3">{t("surgery")}</th>
                      <th className="px-4 py-3">{t("quantity")}</th>
                      <th className="px-4 py-3">{t("toCharge")}</th>
                    </tr>
                  }
                >
                  {(model.data?.bySurgery ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="ui-table-cell text-center text-gray-500"
                      >
                        {t("emptySurgery")}
                      </td>
                    </tr>
                  ) : (
                    model.data?.bySurgery.map((row) => (
                      <tr key={row.id} className="ui-table-row">
                        <td className="ui-table-cell font-medium">
                          {row.name}
                        </td>
                        <td className="ui-table-cell">{row.count}</td>
                        <td className="ui-table-cell font-semibold text-primary">
                          {formatCurrency(row.commission)}
                        </td>
                      </tr>
                    ))
                  )}
                </TableShell>
              </TableCard>

              <TableCard title={t("byStatus")}>
                <TableShell
                  columns={
                    <tr>
                      <th className="px-4 py-3">{t("status")}</th>
                      <th className="px-4 py-3">{t("quantity")}</th>
                    </tr>
                  }
                >
                  {(model.data?.byStatus ?? []).map((row) => (
                    <tr key={row.status} className="ui-table-row">
                      <td className="ui-table-cell font-medium">
                        {statusLabel(row.status, t)}
                      </td>
                      <td className="ui-table-cell">{row.count}</td>
                    </tr>
                  ))}
                </TableShell>
              </TableCard>
            </div>

            <div
              className={
                model.loading ? "pointer-events-none opacity-40" : undefined
              }
            >
              <TableCard title={t("detailTitle")}>
                <TableShell
                  columns={
                    <tr>
                      <th className="px-4 py-3">{t("date")}</th>
                      <th className="px-4 py-3">{t("patient")}</th>
                      <th className="px-4 py-3">{t("status")}</th>
                      <th className="px-4 py-3">{t("nucleus")}</th>
                      <th className="px-4 py-3">{t("surgery")}</th>
                      <th className="px-4 py-3">{t("nucleusCommission")}</th>
                      <th className="px-4 py-3">{t("surgeryCommission")}</th>
                    </tr>
                  }
                >
                  {(model.data?.items ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="ui-table-cell text-center text-gray-500"
                      >
                        {t("emptyDetail")}
                      </td>
                    </tr>
                  ) : (
                    model.data?.items.map((item) => (
                      <tr key={item.id} className="ui-table-row">
                        <td className="ui-table-cell whitespace-nowrap">
                          {formatDate(item.referenceDate)}
                        </td>
                        <td className="ui-table-cell font-medium">
                          {item.patientName}
                        </td>
                        <td className="ui-table-cell">
                          {statusLabel(item.status, t)}
                        </td>
                        <td className="ui-table-cell">{item.nucleusName}</td>
                        <td className="ui-table-cell">
                          {item.surgeryName ?? t("noSurgery")}
                        </td>
                        <td className="ui-table-cell">
                          {item.billable
                            ? formatCurrency(item.nucleusCommission)
                            : "—"}
                        </td>
                        <td className="ui-table-cell">
                          {item.billable && item.surgeryCommission > 0
                            ? formatCurrency(item.surgeryCommission)
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </TableShell>
              </TableCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
