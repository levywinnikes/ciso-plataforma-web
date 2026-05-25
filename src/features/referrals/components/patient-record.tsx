"use client";

import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Referral } from "../types";
import { formatDate } from "../utils";

export function PatientRecord({ referral }: { referral: Referral }) {
  const t = useTranslations("patientRecord");
  return (
    <div className="ui-record-panel">
      <div className="ui-record-panel-header">
        <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-primary">
          <ClipboardList className="mr-2 h-4 w-4" />
          {t("header")}
        </h4>
        <span className="text-xs font-semibold text-gray-500">
          {t("dateLabel")}: {formatDate(referral.createdAt)}
        </span>
      </div>

      <div className="space-y-6 p-5">
        <div>
          <h5 className="ui-record-section-title">{t("section1Title")}</h5>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2">
              <span className="mb-1 block text-xs text-gray-500">
                {t("fullName")}
              </span>
              <span className="font-bold text-gray-900">
                {referral.patientName}
              </span>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500">
                {t("birthDate")}
              </span>
              <span className="font-semibold text-gray-900">
                {referral.patientBirthDate
                  ? formatDate(referral.patientBirthDate)
                  : t("notInformed")}
              </span>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500">
                {t("phone")}
              </span>
              <span className="font-semibold text-gray-900">
                {referral.patientPhone || t("notInformed")}
              </span>
            </div>
          </div>
          {referral.patientDocument && (
            <div className="mt-3">
              <span className="mb-1 block text-xs text-gray-500">
                {t("document")}
              </span>
              <span className="font-semibold text-gray-900">
                {referral.patientDocument}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h5 className="ui-record-section-title">{t("section2Title")}</h5>
          <div className="space-y-4">
            {referral.systemicDiseases && (
              <div className="rounded-md border border-orange-100 bg-orange-50/50 p-3">
                <span className="mb-1 block text-xs font-bold text-orange-800">
                  {t("systemicDiseases")}
                </span>
                <span className="text-sm text-gray-800">
                  {referral.systemicDiseases}
                </span>
              </div>
            )}
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <span className="mb-1 block text-xs font-bold text-gray-500">
                {t("complaint")}
              </span>
              <span className="text-sm italic text-gray-800">
                &ldquo;{referral.clinicalNotes}&rdquo;
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h5 className="ui-record-section-title">{t("section3Title")}</h5>
          <div>
            <span className="mb-1 block text-xs text-gray-500">
              {t("baseNucleus")}
            </span>
            <span className="font-bold text-primary">
              {referral.nucleusName}
            </span>
            {referral.nucleusSnapshotServices &&
              referral.nucleusSnapshotServices.length > 0 && (
                <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-2.5">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Serviços Incluídos
                  </span>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {referral.nucleusSnapshotServices.map((service, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between border-b border-gray-100/50 py-0.5 last:border-0"
                      >
                        <span>• {service.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
