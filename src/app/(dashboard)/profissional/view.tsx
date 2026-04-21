import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button, PageHeader, TableCard } from "@/components/ui";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { formatDate } from "@/features/referrals/utils";

import type { ProfissionalPageModel } from "./schema";

interface ProfissionalPageViewProps {
  model: ProfissionalPageModel;
}

export function ProfissionalPageView({ model }: ProfissionalPageViewProps) {
  const t = useTranslations("professional");
  const common = useTranslations("common");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Link href="/profissional/novo">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              {t("newReferral")}
            </Button>
          </Link>
        }
      />

      <TableCard title={t("referrals")}>
        <table className="ui-table">
          <thead className="ui-table-head">
            <tr>
              <th className="px-6 py-3">{common("patient")}</th>
              <th className="px-6 py-3">{t("nucleus")}</th>
              <th className="px-6 py-3">{t("date")}</th>
              <th className="px-6 py-3">{common("doctor")}</th>
              <th className="px-6 py-3">{common("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {model.referrals.map((referral) => (
              <tr key={referral.id} className="ui-table-row">
                <td className="ui-table-cell whitespace-nowrap font-medium text-gray-900">
                  {referral.patientName}
                </td>
                <td className="ui-table-cell">{referral.nucleusName}</td>
                <td className="ui-table-cell whitespace-nowrap">
                  {formatDate(referral.createdAt)}
                </td>
                <td className="ui-table-cell whitespace-nowrap">
                  {referral.doctor ?? common("toDefine")}
                </td>
                <td className="ui-table-cell whitespace-nowrap">
                  <ReferralStatusBadge status={referral.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
