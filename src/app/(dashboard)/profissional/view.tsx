import { ChevronLeft, ChevronRight, Eye, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  Button,
  Input,
  Modal,
  PageHeader,
  Select,
  TableCard,
  TableShell,
} from "@/components/ui";
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select
          value={model.filters.status}
          onChange={(e) =>
            model.setFilters({ ...model.filters, status: e.target.value })
          }
          className="w-full md:w-48"
        >
          <option value="ALL">Todos os Status</option>
          <option value="Encaminhado">Encaminhado</option>
          <option value="Agendado">Agendado</option>
          <option value="Atendido">Atendido</option>
          <option value="Cancelado">Cancelado</option>
        </Select>

        <Input
          type="date"
          value={model.filters.date}
          onChange={(e) =>
            model.setFilters({ ...model.filters, date: e.target.value })
          }
          className="w-full md:w-48"
        />

        {/* Adicionando filtros extras (Núcleo e Médico) caso a clínica cresça muito */}
        <Input
          placeholder="Buscar Médico..."
          value={model.filters.doctor === "ALL" ? "" : model.filters.doctor}
          onChange={(e) =>
            model.setFilters({
              ...model.filters,
              doctor: e.target.value || "ALL",
            })
          }
          className="w-full md:w-48"
        />
      </div>

      <TableCard title={t("referrals")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{common("patient")}</th>
              <th className="px-6 py-3">{t("nucleus")}</th>
              <th className="px-6 py-3">{t("date")}</th>
              <th className="px-6 py-3">{common("doctor")}</th>
              <th className="px-6 py-3">{common("status")}</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          }
        >
          {model.filteredReferrals.map((referral) => (
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
              <td className="ui-table-cell text-right">
                <Button
                  variant="ghost"
                  className="p-2"
                  onClick={() => model.openModal(referral)}
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4 text-emerald-700" />
                </Button>
              </td>
            </tr>
          ))}
        </TableShell>

        {/* Pagination Controls */}
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

      <Modal
        isOpen={model.isModalOpen}
        onClose={model.closeModal}
        title="Detalhes do Encaminhamento"
      >
        <p className="mb-6 text-sm text-gray-500">
          Visualização em modo somente leitura.
        </p>
        {model.selectedReferral && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Paciente
                </span>
                <span className="block text-gray-900">
                  {model.selectedReferral.patientName}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Status
                </span>
                <span className="mt-1 block">
                  <ReferralStatusBadge status={model.selectedReferral.status} />
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Núcleo
                </span>
                <span className="block text-gray-900">
                  {model.selectedReferral.nucleusName}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Clínica Destino
                </span>
                <span className="block text-gray-900">
                  {model.selectedReferral.clinicName}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Médico Atribuído
                </span>
                <span className="block text-gray-900">
                  {model.selectedReferral.doctor || "A definir"}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Data de Criação
                </span>
                <span className="block text-gray-900">
                  {formatDate(model.selectedReferral.createdAt)}
                </span>
              </div>
            </div>

            {model.selectedReferral.clinicalNotes && (
              <div className="border-t border-gray-100 pt-2">
                <span className="mb-1 block text-sm font-medium text-gray-500">
                  Notas Clínicas
                </span>
                <p className="whitespace-pre-wrap text-sm text-gray-900">
                  {model.selectedReferral.clinicalNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
