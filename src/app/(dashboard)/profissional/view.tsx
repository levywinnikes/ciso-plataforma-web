import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  cn,
  FileUploadArea,
  FloatingInput,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableCard,
  TableShell,
  Textarea,
} from "@/components/ui";
import { AppointmentCalendar } from "@/features/referrals/components/appointment-calendar";
import { BlockStatusFields } from "@/features/referrals/components/block-status-fields";
import { PriceSummary } from "@/features/referrals/components/price-summary";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { isReferralOverdue } from "@/features/referrals/overdue";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getNucleusPriceSummary,
} from "@/features/referrals/utils";
import { useFormError } from "@/i18n/use-form-error";

import type { ProfissionalPageModel } from "./schema";

interface ProfissionalPageViewProps {
  model: ProfissionalPageModel;
}

export function ProfissionalPageView({ model }: ProfissionalPageViewProps) {
  const t = useTranslations("professional");
  const common = useTranslations("common");
  const agenda = useTranslations("agenda");
  const tNew = useTranslations("newReferral");
  const tError = useFormError();

  const { register, formState, watch } = model.editForm;
  const errors = formState.errors;

  const priceSummary = model.editSelectedNucleus
    ? getNucleusPriceSummary(model.editSelectedNucleus)
    : null;

  const blockedCount = model.blockedCount;

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

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            model.listTab === "calendar"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => model.setListTab("calendar")}
        >
          {t("tabCalendar")}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            model.listTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => model.setListTab("active")}
        >
          {t("tabActive")}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            model.listTab === "blocked"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => model.setListTab("blocked")}
        >
          {t("tabBlocked")}
          {blockedCount > 0 ? (
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
              {blockedCount}
            </span>
          ) : null}
        </button>
      </div>

      {model.listTab === "calendar" ? (
        <AppointmentCalendar
          onSelectReferral={model.openModal}
          refreshKey={model.calendarRefreshKey}
          actions={{
            policy: "professional",
            onView: model.openModal,
            onEdit: model.openEditModal,
            onDelete: (referral) => {
              if (
                window.confirm(
                  "Tem certeza que deseja excluir este encaminhamento?",
                )
              ) {
                void model.deleteReferral(referral.id);
              }
            },
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {model.listTab === "active" ? (
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
              </Select>
            ) : null}

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
                model.filteredReferrals.map((referral) => {
                  const overdue = isReferralOverdue(referral);
                  return (
                    <tr
                      key={referral.id}
                      className={cn(
                        "ui-table-row",
                        overdue &&
                          "!bg-rose-50 shadow-[inset_4px_0_0_0_rgb(225,29,72)] hover:!bg-rose-100/80",
                      )}
                    >
                      <td className="ui-table-cell whitespace-nowrap font-medium text-gray-900">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{referral.patientName}</span>
                          {overdue ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-800">
                              <Clock className="h-3 w-3" />
                              {agenda("overdueSeal")}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="ui-table-cell">{referral.nucleusName}</td>
                      <td className="ui-table-cell whitespace-nowrap">
                        {formatDate(referral.createdAt)}
                      </td>
                      <td className="ui-table-cell whitespace-nowrap">
                        {referral.doctor ?? common("toDefine")}
                      </td>
                      <td className="ui-table-cell">
                        <ReferralStatusBadge
                          status={referral.status}
                          justificativaBloqueio={referral.justificativaBloqueio}
                        />
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
                        {referral.status === "Encaminhado" ||
                        referral.status === "Bloqueado" ? (
                          <>
                            <Button
                              variant="ghost"
                              className="p-2"
                              onClick={() => model.openEditModal(referral)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4 text-amber-600" />
                            </Button>
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
                          </>
                        ) : (
                          <div className="group relative inline-block">
                            <Button
                              variant="ghost"
                              className="cursor-not-allowed p-2 opacity-50"
                              disabled
                            >
                              <Pencil className="h-4 w-4 text-gray-400" />
                            </Button>
                            <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 hidden whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-md group-hover:block">
                              Só é possível editar encaminhamentos com status
                              &quot;Encaminhado&quot; ou &quot;Bloqueado&quot;
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
        </>
      )}

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
              {model.selectedReferral.status === "Bloqueado" &&
              model.selectedReferral.justificativaBloqueio ? (
                <div className="mb-4 rounded-md border border-orange-100 bg-orange-50 p-3 text-sm text-orange-900">
                  <span className="font-semibold">Justificativa: </span>
                  {model.selectedReferral.justificativaBloqueio}
                </div>
              ) : null}
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
                    Convênio
                  </span>
                  <span className="mt-1 block text-sm font-medium text-gray-900">
                    {model.selectedReferral.agreementName || "Sem convênio"}
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

      <Modal
        isOpen={model.isEditModalOpen}
        onClose={model.closeEditModal}
        title="Editar Encaminhamento"
        maxWidth="max-w-5xl"
      >
        <p className="mb-6 text-left text-sm text-gray-500">
          Preencha os campos abaixo para atualizar as informações do
          encaminhamento.
        </p>
        <form
          noValidate
          onSubmit={model.onSubmitEdit}
          className="mt-4 grid gap-6 text-left lg:grid-cols-12"
        >
          <div className="space-y-6 lg:col-span-8">
            <CardSection title={tNew("patientData")}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label={""} error={tError(errors.patientName?.message)}>
                    <FloatingInput
                      required
                      label={tNew("patientName")}
                      {...register("patientName")}
                    />
                  </Field>
                </div>
                <Field
                  label={""}
                  hint={tNew("birthDateHint")}
                  error={tError(errors.patientBirthDate?.message)}
                >
                  <FloatingInput
                    mask="date"
                    inputMode="numeric"
                    autoComplete="bday"
                    required
                    label={tNew("birthDate")}
                    {...register("patientBirthDate")}
                  />
                </Field>
                <Field label={""} error={tError(errors.patientPhone?.message)}>
                  <FloatingInput
                    mask="phone"
                    required
                    label={tNew("phone")}
                    {...register("patientPhone")}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field
                    label={""}
                    hint={tNew("optional")}
                    error={tError(errors.patientDocument?.message)}
                  >
                    <FloatingInput
                      label={tNew("document")}
                      {...register("patientDocument")}
                    />
                  </Field>
                </div>
              </div>
            </CardSection>

            <CardSection title={tNew("clinicalInfo")}>
              <div className="grid gap-4">
                <Field
                  label={tNew("systemicDiseases")}
                  hint={tNew("optionalFreeText")}
                >
                  <Textarea {...register("systemicDiseases")} />
                </Field>
                <Field label={tNew("clinicalNotes")}>
                  <Textarea
                    {...register("clinicalNotes")}
                    placeholder={tNew("clinicalNotesPlaceholder")}
                  />
                </Field>
                <BlockStatusFields
                  register={register}
                  watch={watch}
                  statusError={errors.status}
                  justificationError={errors.justificativaBloqueio}
                />
              </div>
            </CardSection>

            <CardSection title={tNew("documents")}>
              <FileUploadArea
                files={model.editDocuments}
                onSelectFiles={model.handleUploadFilesEdit}
                onRemoveFile={model.handleRemoveDocumentEdit}
                isUploading={model.isUploadingEdit}
                label={tNew("includeDocuments")}
              />
            </CardSection>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <CardSection
              title={tNew("careNuclei")}
              titleClassName="mb-4 text-lg font-bold text-primary"
            >
              <div className="mb-4 border-b pb-4">
                <Field
                  label={tNew("selectClinic")}
                  required
                  error={tError(errors.clinicId?.message)}
                >
                  <Select {...register("clinicId")}>
                    <option value="">{common("select")}</option>
                    {model.editClinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {model.editForm.watch("clinicId") && (
                <div className="animate-fadeIn mb-4 border-b pb-4">
                  <Field
                    label={tNew("selectAgreement") || "Selecione o Convênio"}
                    error={tError(errors.agreementId?.message)}
                  >
                    <Select {...register("agreementId")}>
                      <option value="">
                        {tNew("noAgreement") || "Sem convênio"}
                      </option>
                      {(
                        model.editClinics.find(
                          (c) => c.id === model.editForm.watch("clinicId"),
                        )?.agreements || []
                      ).map(({ agreement }) => (
                        <option key={agreement.id} value={agreement.id}>
                          {agreement.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              )}

              <Field
                label={tNew("selectNucleus")}
                required
                error={tError(errors.nucleusId?.message)}
              >
                <Select {...register("nucleusId")}>
                  <option value="">{common("select")}</option>
                  {model.editNuclei.map((nucleus) => (
                    <option key={nucleus.id} value={nucleus.id}>
                      {nucleus.name}
                    </option>
                  ))}
                </Select>
              </Field>

              {model.editSelectedNucleus && priceSummary && (
                <div className="mt-4 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-primary">
                    {model.editSelectedNucleus.description}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    {model.editSelectedNucleus.services.map((service) => (
                      <li
                        key={service.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <span>{service.name}</span>
                        <span>{formatCurrency(service.basePrice)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-primary/20 pt-3">
                    <PriceSummary {...priceSummary} variant="inline" />
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={model.closeEditModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={model.isSavingEdit}
                >
                  {model.isSavingEdit ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardSection>
          </div>
        </form>
      </Modal>
    </div>
  );
}
