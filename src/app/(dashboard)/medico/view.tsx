import { useTranslations } from "next-intl";

import { Button, Modal, PageHeader, TableCard } from "@/components/ui";
import { MedicalConductForm } from "@/features/referrals/components/medical-conduct-form";
import { PatientRecord } from "@/features/referrals/components/patient-record";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { formatDateTime } from "@/features/referrals/utils";

import type { MedicoPageModel } from "./schema";

interface MedicoPageViewProps {
  model: MedicoPageModel;
}

export function MedicoPageView({ model }: MedicoPageViewProps) {
  const t = useTranslations("doctor");
  const common = useTranslations("common");

  return (
    <div className="relative space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-6">
        <TableCard
          title={t("agendaToday")}
          headerClassName="bg-primary text-white"
        >
          <table className="ui-table">
            <thead className="ui-table-head">
              <tr>
                <th className="px-6 py-3">{t("dateAndTime")}</th>
                <th className="px-6 py-3">{common("patient")}</th>
                <th className="px-6 py-3">{t("nucleus")}</th>
                <th className="px-6 py-3">{t("responsibleDoctor")}</th>
                <th className="px-6 py-3">{common("status")}</th>
                <th className="px-6 py-3 text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {model.items.map((item) => (
                <tr
                  key={item.id}
                  className="ui-table-row cursor-pointer"
                  onClick={() => model.handleOpenAtendimento(item)}
                >
                  <td className="ui-table-cell whitespace-nowrap font-medium text-gray-900">
                    {item.appointmentDate
                      ? formatDateTime(item.appointmentDate)
                      : common("notAvailable")}
                  </td>
                  <td className="ui-table-cell whitespace-nowrap">
                    {item.patientName}
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
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>

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
            >
              {common("cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={model.handleSave}
              className="flex items-center bg-green-700 hover:bg-green-800"
            >
              {t("saveCare")}
            </Button>
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
            onAddFile={model.handleAddFile}
          />
        </div>
      </Modal>
    </div>
  );
}
