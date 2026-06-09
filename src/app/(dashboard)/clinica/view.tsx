import { useTranslations } from "next-intl";

import { PageHeader, StatCard, TableCard, TableShell } from "@/components/ui";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { formatDate } from "@/features/referrals/utils";

import type { ClinicaPageModel } from "./schema";

interface ClinicaPageViewProps {
  model: ClinicaPageModel;
}

export function ClinicaPageView({ model }: ClinicaPageViewProps) {
  const t = useTranslations("clinic");
  const common = useTranslations("common");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label={t("scheduled")} value={model.agendadosCount} />
        <StatCard label={t("attended")} value={model.atendidosCount} />
      </div>

      <TableCard title={t("scheduledQueue")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{common("patient")}</th>
              <th className="px-6 py-3">{t("nucleus")}</th>
              <th className="px-6 py-3">{t("sendDate")}</th>
              <th className="px-6 py-3">{common("status")}</th>
              <th className="px-6 py-3">{t("appointmentDate")}</th>
              <th className="px-6 py-3">{common("doctor")}</th>
            </tr>
          }
        >
          {model.referrals.map((referral) => (
            <tr key={referral.id} className="ui-table-row">
              <td className="ui-table-cell font-medium text-gray-900">
                {referral.patientName}
              </td>
              <td className="ui-table-cell">{referral.nucleusName}</td>
              <td className="ui-table-cell">
                {formatDate(referral.createdAt)}
              </td>
              <td className="ui-table-cell">
                <ReferralStatusBadge status={referral.status} />
              </td>
              <td className="ui-table-cell">
                {referral.appointmentDate
                  ? new Date(referral.appointmentDate).toLocaleString("pt-BR")
                  : common("notAvailable")}
              </td>
              <td className="ui-table-cell">
                {referral.doctor ?? common("notAvailable")}
              </td>
            </tr>
          ))}
        </TableShell>
      </TableCard>
    </div>
  );
}
