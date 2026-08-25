"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Button,
  cn,
  ConfirmDialog,
  Modal,
  OverlayLoader,
  PageHeader,
  TableCard,
  TableShell,
} from "@/components/ui";
import { AppointmentCalendar } from "@/features/referrals/components/appointment-calendar";
import { MedicalConductForm } from "@/features/referrals/components/medical-conduct-form";
import { PatientRecord } from "@/features/referrals/components/patient-record";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { isReferralOverdue } from "@/features/referrals/overdue";
import { formatDateTime } from "@/features/referrals/utils";

import type { MedicoPageModel } from "./schema";

interface MedicoPageViewProps {
  model: MedicoPageModel;
}

export function MedicoPageView({ model }: MedicoPageViewProps) {
  const t = useTranslations("doctor");
  const common = useTranslations("common");
  const agenda = useTranslations("agenda");

  return (
    <div className="relative space-y-8">
      {model.isLoading && <OverlayLoader message={common("loading")} />}
      {model.isSaving && <OverlayLoader message={common("saving")} />}
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            model.viewTab === "calendar"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => model.setViewTab("calendar")}
        >
          {t("tabCalendar")}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            model.viewTab === "list"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => model.setViewTab("list")}
        >
          {t("tabList")}
        </button>
      </div>

      {model.viewTab === "calendar" ? (
        <AppointmentCalendar onSelectReferral={model.handleOpenAtendimento} />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <TableCard
            title={t("agendaToday")}
            headerClassName="bg-primary text-white"
          >
            <TableShell
              columns={
                <tr>
                  <th className="px-6 py-3">{t("dateAndTime")}</th>
                  <th className="px-6 py-3">{common("patient")}</th>
                  <th className="px-6 py-3">{t("nucleus")}</th>
                  <th className="px-6 py-3">{t("responsibleDoctor")}</th>
                  <th className="px-6 py-3">{common("status")}</th>
                  <th className="px-6 py-3 text-right">{t("action")}</th>
                </tr>
              }
            >
              {model.items.map((item) => {
                const overdue = isReferralOverdue(item);
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "ui-table-row cursor-pointer",
                      overdue &&
                        "!bg-rose-50 shadow-[inset_4px_0_0_0_rgb(225,29,72)] hover:!bg-rose-100/80",
                    )}
                    onClick={() => model.handleOpenAtendimento(item)}
                  >
                    <td className="ui-table-cell whitespace-nowrap font-medium text-gray-900">
                      {item.appointmentDate
                        ? formatDateTime(item.appointmentDate)
                        : common("notAvailable")}
                    </td>
                    <td className="ui-table-cell whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{item.patientName}</span>
                        {overdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-800">
                            <Clock className="h-3 w-3" />
                            {agenda("overdueSeal")}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td
                      className="ui-table-cell max-w-[200px] truncate whitespace-nowrap"
                      title={item.nucleusName}
                    >
                      {item.nucleusName}
                    </td>
                    <td className="ui-table-cell whitespace-nowrap">
                      <span className="font-medium text-gray-700">
                        {item.doctor || t("notAssigned")}
                      </span>
                    </td>
                    <td className="ui-table-cell whitespace-nowrap">
                      <ReferralStatusBadge status={item.status} />
                    </td>
                    <td className="ui-table-cell whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        className="text-xs font-semibold text-primary hover:bg-primary/5"
                        onClick={(event) => {
                          event.stopPropagation();
                          model.handleOpenAtendimento(item);
                        }}
                      >
                        {t("openRecord")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </TableShell>
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3">
              <p className="text-sm text-gray-500">
                Página{" "}
                <span className="font-medium text-gray-900">
                  {model.currentPage}
                </span>{" "}
                de{" "}
                <span className="font-medium text-gray-900">
                  {model.totalPages}
                </span>
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() =>
                    model.setCurrentPage(Math.max(1, model.currentPage - 1))
                  }
                  disabled={model.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="px-2 py-1"
                  onClick={() =>
                    model.setCurrentPage(
                      Math.min(model.totalPages, model.currentPage + 1),
                    )
                  }
                  disabled={model.currentPage === model.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TableCard>
        </div>
      )}

      <Modal
        isOpen={Boolean(model.selectedReferral)}
        onClose={() => model.setSelectedReferral(null)}
        title={t("specializedCare")}
        maxWidth="max-w-4xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => model.setSelectedReferral(null)}
              disabled={model.isSaving}
            >
              {common("cancel")}
            </Button>
            {model.selectedReferral?.status === "Agendado" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => model.handleSave(false)}
                  isLoading={model.isSaving}
                  className="flex items-center border-primary text-primary hover:bg-primary/5"
                >
                  {t("saveCare")}
                </Button>
                <Button
                  variant="primary"
                  onClick={model.handleCompleteClick}
                  isLoading={model.isSaving}
                  className="flex items-center bg-green-700 hover:bg-green-800"
                >
                  {t("completeCare")}
                </Button>
              </>
            )}
          </>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {model.selectedReferral && (
            <PatientRecord referral={model.selectedReferral} />
          )}
          <MedicalConductForm
            notes={model.notes}
            onNotesChange={model.setNotes}
            conduct={model.conduct}
            onConductChange={model.setConduct}
            files={model.files}
            onSelectFiles={model.handleUploadFiles}
            onRemoveFile={model.handleRemoveFile}
            isUploading={model.isUploading}
            surgeryId={model.surgeryId}
            onSurgeryIdChange={model.setSurgeryId}
            surgeryPrice={model.surgeryPrice}
            onSurgeryPriceChange={model.setSurgeryPrice}
            disabled={model.selectedReferral?.status === "Atendido"}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={model.isConfirmOpen}
        onClose={() => model.setIsConfirmOpen(false)}
        title={t("confirmCompleteTitle")}
        message={t("confirmCompleteMessage")}
        hint={t("confirmCompleteHint")}
        cancelLabel={common("cancel")}
        confirmLabel={common("confirm")}
        variant="warning"
        onConfirm={model.handleConfirmComplete}
      />
    </div>
  );
}
