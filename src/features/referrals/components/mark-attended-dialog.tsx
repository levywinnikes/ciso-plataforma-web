"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Modal } from "@/components/ui";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import type { Referral } from "@/features/referrals/types";
import { formatDate, formatDateTime } from "@/features/referrals/utils";

interface MarkAttendedDialogProps {
  referral: Referral | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-100/80 bg-white/80 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800/70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

export function MarkAttendedDialog({
  referral,
  isSaving,
  onClose,
  onConfirm,
}: MarkAttendedDialogProps) {
  const t = useTranslations("adminDashboard");
  const common = useTranslations("common");

  return (
    <Modal
      isOpen={referral !== null}
      onClose={onClose}
      title={t("markAttendedTitle")}
      maxWidth="max-w-lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {common("cancel")}
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            isLoading={isSaving}
            onClick={() => {
              void onConfirm();
            }}
          >
            {t("markAttendedConfirm")}
          </Button>
        </>
      }
    >
      {referral ? (
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {t("markAttendedMessage")}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {t("markAttendedHint")}
              </p>
            </div>
          </div>

          <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
            <Detail label={common("patient")} value={referral.patientName} />
            <div className="rounded-lg border border-emerald-100/80 bg-white/80 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800/70">
                {common("status")}
              </p>
              <div className="mt-1">
                <ReferralStatusBadge
                  status={referral.status}
                  justificativaBloqueio={referral.justificativaBloqueio}
                />
              </div>
            </div>
            <Detail
              label={t("officeColumn")}
              value={referral.officeName ?? common("notAvailable")}
            />
            <Detail
              label={t("clinicColumn")}
              value={referral.clinicName ?? common("notAvailable")}
            />
            <Detail
              label={common("doctor")}
              value={referral.doctor ?? common("notAvailable")}
            />
            <Detail
              label={t("appointmentColumn")}
              value={
                referral.appointmentDate
                  ? formatDateTime(referral.appointmentDate)
                  : common("notAvailable")
              }
            />
            <Detail
              label={t("createdByColumn")}
              value={referral.createdByUserName ?? common("notAvailable")}
            />
            <Detail
              label={t("createdColumn")}
              value={formatDate(referral.createdAt)}
            />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
