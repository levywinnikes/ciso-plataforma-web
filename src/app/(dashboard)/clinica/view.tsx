import { useTranslations } from "next-intl";

import {
  Button,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
  TableCard,
} from "@/components/ui";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { formatDate } from "@/features/referrals/utils";

import { type ClinicaPageModel, DOCTORS } from "./schema";

interface ClinicaPageViewProps {
  model: ClinicaPageModel;
}

export function ClinicaPageView({ model }: ClinicaPageViewProps) {
  const t = useTranslations("clinic");
  const common = useTranslations("common");

  const { register, formState } = model.scheduleForm;
  const errors = formState.errors;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label={t("pendingReferrals")}
          value={model.pendingReferralsCount}
        />
        <StatCard label={t("scheduled")} value={model.agendadosCount} />
        <StatCard label={t("attended")} value={model.atendidosCount} />
      </div>

      <TableCard title={t("triageQueue")}>
        <table className="ui-table">
          <thead className="ui-table-head">
            <tr>
              <th className="px-6 py-3">{common("patient")}</th>
              <th className="px-6 py-3">{t("nucleus")}</th>
              <th className="px-6 py-3">{t("sendDate")}</th>
              <th className="px-6 py-3">{common("status")}</th>
              <th className="px-6 py-3">{t("appointmentDate")}</th>
              <th className="px-6 py-3">{common("doctor")}</th>
              <th className="px-6 py-3 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
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
                <td className="ui-table-cell text-right">
                  <Button
                    variant="outline"
                    onClick={() => model.handleOpenTriage(referral)}
                  >
                    {t("triage")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Modal
        isOpen={Boolean(model.selectedReferral)}
        onClose={() => model.setSelectedReferral(null)}
        title={t("triage")}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => model.setSelectedReferral(null)}
            >
              {common("cancel")}
            </Button>
            <Button onClick={model.onSaveSchedule}>{t("saveSchedule")}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t("referral")}:{" "}
            <span className="font-semibold text-gray-900">
              {model.selectedReferral?.patientName}
            </span>
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {common("doctor")}
            </label>
            <Select {...register("doctor")}>
              <option value="">{common("select")}</option>
              {DOCTORS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            {errors.doctor && (
              <p className="text-xs text-red-500">{errors.doctor.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("scheduleDate")}
            </label>
            <Input type="datetime-local" {...register("scheduleDate")} />
            {errors.scheduleDate && (
              <p className="text-xs text-red-500">
                {errors.scheduleDate.message}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
