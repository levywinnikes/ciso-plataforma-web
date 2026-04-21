import { useTranslations } from "next-intl";

import { PageHeader, StatCard, TableCard } from "@/components/ui";
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
        <table className="ui-table">
          <thead className="ui-table-head">
            <tr>
              <th className="px-6 py-3">{t("nucleus")}</th>
              <th className="px-6 py-3">{t("referralsQuantity")}</th>
              <th className="px-6 py-3">{t("unitPrice")}</th>
              <th className="px-6 py-3">{t("revenue")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
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
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
