import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  Button,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableCard,
  TableShell,
} from "@/components/ui";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/features/referrals/utils";

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
          {model.isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skel-${idx}`} className="ui-table-row">
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="ui-table-cell"></td>
              </tr>
            ))
          ) : model.filteredReferrals.length === 0 ? (
            <tr className="ui-table-row">
              <td
                colSpan={6}
                className="ui-table-cell py-8 text-center text-gray-500"
              >
                Nenhum encaminhamento encontrado.
              </td>
            </tr>
          ) : (
            model.filteredReferrals.map((referral) => (
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
                <td className="ui-table-cell space-x-1 text-right">
                  <Button
                    variant="ghost"
                    className="p-2"
                    onClick={() => model.openModal(referral)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4 text-emerald-700" />
                  </Button>
                  {referral.status === "Encaminhado" && (
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Tem certeza que deseja excluir este encaminhamento?",
                          )
                        ) {
                          model.deleteReferral(referral.id);
                        }
                      }}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
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
        maxWidth="max-w-3xl"
      >
        <p className="mb-6 text-sm text-gray-500">
          Visualização em modo somente leitura.
        </p>
        {model.selectedReferral && (
          <div className="space-y-8">
            {/* Section 1: Paciente */}
            <div className="rounded-lg border border-gray-100 p-5">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
                Dados do Paciente
              </h4>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Nome Completo
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.patientName}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Nascimento
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {formatDate(model.selectedReferral.patientBirthDate)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Documento
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.patientDocument || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Telefone
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.patientPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Contexto e Encaminhamento */}
            <div className="rounded-lg border border-gray-100 p-5">
              <h4 className="mb-4 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-primary">
                <span>Detalhes do Encaminhamento</span>
                <ReferralStatusBadge status={model.selectedReferral.status} />
              </h4>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Data de Criação
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {formatDateTime(model.selectedReferral.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Consultório de Origem
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.officeName || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Clínica Destino
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.clinicName || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Núcleo
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.nucleusName}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-gray-500">
                    Valor Acordado
                  </span>
                  <span className="mt-1 block text-lg font-bold text-emerald-600">
                    {model.selectedReferral.nucleusPrice !== undefined
                      ? formatCurrency(
                          Number(model.selectedReferral.nucleusPrice),
                        )
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Lista de Serviços do Snapshot */}
              {model.selectedReferral.nucleusSnapshotServices &&
                model.selectedReferral.nucleusSnapshotServices.length > 0 && (
                  <div className="mt-6 rounded-md border border-emerald-100 bg-emerald-50/50 p-4">
                    <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Serviços Inclusos
                    </span>
                    <ul className="space-y-2">
                      {model.selectedReferral.nucleusSnapshotServices.map(
                        (svc, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between border-b border-emerald-100/50 pb-2 text-sm last:border-0 last:pb-0"
                          >
                            <span className="text-emerald-900">{svc.name}</span>
                            <span className="font-semibold text-emerald-700">
                              {formatCurrency(svc.basePrice)}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
            </div>

            {/* Section 3: Retorno do Especialista */}
            <div className="rounded-lg border border-gray-100 bg-blue-50/30 p-5">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-800">
                Retorno da Especialidade
              </h4>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-semibold uppercase text-blue-600/70">
                    Médico Atribuído
                  </span>
                  <span className="mt-1 block text-sm font-medium text-blue-900">
                    {model.selectedReferral.doctor || "A definir"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-blue-600/70">
                    Data do Agendamento
                  </span>
                  <span className="mt-1 block text-sm font-medium text-blue-900">
                    {model.selectedReferral.appointmentDate
                      ? formatDateTime(model.selectedReferral.appointmentDate)
                      : "A definir"}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações Clínicas Extensas */}
            <div className="space-y-6">
              <h4 className="border-b border-gray-100 pb-2 text-sm font-bold uppercase tracking-wider text-primary">
                Notas e Observações Clínicas
              </h4>

              {model.selectedReferral.clinicalSuspicion && (
                <div className="rounded-md bg-gray-50 p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Suspeita Clínica
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {model.selectedReferral.clinicalSuspicion}
                  </p>
                </div>
              )}

              {model.selectedReferral.systemicDiseases && (
                <div className="rounded-md bg-gray-50 p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Doenças Sistêmicas
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {model.selectedReferral.systemicDiseases}
                  </p>
                </div>
              )}

              {model.selectedReferral.clinicalNotes && (
                <div className="rounded-md bg-gray-50 p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Notas Clínicas (Profissional)
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {model.selectedReferral.clinicalNotes}
                  </p>
                </div>
              )}

              {model.selectedReferral.specialistConduct && (
                <div className="rounded-md border border-blue-100 bg-blue-50/50 p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-blue-800">
                    Conduta do Especialista
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">
                    {model.selectedReferral.specialistConduct}
                  </p>
                </div>
              )}

              {model.selectedReferral.specialistNotes && (
                <div className="rounded-md border border-blue-100 bg-blue-50/50 p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-blue-800">
                    Notas do Especialista
                  </span>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900">
                    {model.selectedReferral.specialistNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
