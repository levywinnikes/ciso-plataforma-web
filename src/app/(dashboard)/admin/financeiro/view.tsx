import { useTranslations } from "next-intl";

import { PageHeader, StatCard, TableCard, TableShell } from "@/components/ui";
import { formatCurrency } from "@/features/referrals/utils";

import type { FinanceiroPageModel } from "./schema";

interface FinanceiroPageViewProps {
  model: FinanceiroPageModel;
}

export function FinanceiroPageView({ model }: FinanceiroPageViewProps) {
  const t = useTranslations("financial");
  const clinic = useTranslations("clinic");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">
            Consultório
          </label>
          <select
            className="ui-field w-full"
            value={model.selectedOfficeId}
            onChange={(e) => model.setSelectedOfficeId(e.target.value)}
          >
            <option value="">Todos</option>
            {model.availableOffices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">
            Data Inicial
          </label>
          <input
            type="date"
            className="ui-field w-full"
            value={model.startDate}
            onChange={(e) => model.setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">
            Data Final
          </label>
          <input
            type="date"
            className="ui-field w-full"
            value={model.endDate}
            onChange={(e) => model.setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label={t("expectedRevenue")}
          value={formatCurrency(model.totalReceita)}
          valueClassName="text-2xl font-bold text-primary"
        />
        <StatCard
          label={clinic("pendingReferrals")}
          value={model.encaminhadosCount}
        />
        <StatCard label={clinic("scheduled")} value={model.agendadosCount} />
        <StatCard label={clinic("attended")} value={model.atendidosCount} />
      </div>

      <TableCard title={t("revenueByNucleus")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{t("nucleus")}</th>
              <th className="px-6 py-3">{t("referralsQuantity")}</th>
              <th className="px-6 py-3">{t("unitPrice")}</th>
              <th className="px-6 py-3">{t("revenue")}</th>
            </tr>
          }
        >
          {model.revenueRows.map(({ nucleus, count, revenue }) => (
            <tr key={nucleus.id} className="ui-table-row">
              <td className="ui-table-cell font-medium text-gray-900">
                {nucleus.name}
              </td>
              <td className="ui-table-cell">{count}</td>
              <td className="ui-table-cell">
                {formatCurrency(nucleus.chargedPrice)}
              </td>
              <td className="ui-table-cell font-semibold text-primary">
                {formatCurrency(revenue)}
              </td>
            </tr>
          ))}
        </TableShell>
      </TableCard>
    </div>
  );
}
