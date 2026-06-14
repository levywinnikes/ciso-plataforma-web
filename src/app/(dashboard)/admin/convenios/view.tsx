"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  ConfirmDialog,
  FloatingInput,
  Input,
  Modal,
  PageHeader,
  Skeleton,
  TableCard,
  TableShell,
} from "@/components/ui";
import { useFormError } from "@/i18n/use-form-error";

import type { useAgreementsManagement } from "./hooks";

interface AgreementsViewProps {
  model: ReturnType<typeof useAgreementsManagement>;
}

export function AgreementsView({ model }: AgreementsViewProps) {
  const t = useTranslations("adminGlobal.agreements");
  const common = useTranslations("common");
  const tError = useFormError();

  const { register: registerCreate, formState: createState } = model.createForm;
  const { register, formState } = model.editForm;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button onClick={() => model.setIsCreateModalOpen(true)}>
            {t("createAction")}
          </Button>
        }
      />

      <CardSection title={common("select") + "..."}>
        <Input
          placeholder={t("namePlaceholder")}
          value={model.search}
          onChange={(event) => model.setSearch(event.target.value)}
        />
      </CardSection>

      <TableCard title={t("listTitle")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{t("colName")}</th>
              <th className="px-6 py-3">{t("colStatus")}</th>
              <th className="px-6 py-3 text-right">{t("colActions")}</th>
            </tr>
          }
        >
          {model.isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="ui-table-row">
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="ui-table-cell text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))
          ) : model.filteredRows.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="ui-table-cell py-8 text-center text-gray-500"
              >
                Nenhum convênio encontrado
              </td>
            </tr>
          ) : (
            model.filteredRows.map((row) => (
              <tr key={row.id} className="ui-table-row">
                <td className="ui-table-cell font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="ui-table-cell">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      row.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {row.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="ui-table-cell text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => model.openEditModal(row)}
                      aria-label={t("editAction")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-2 text-red-600 hover:bg-red-50"
                      onClick={() => model.setPendingDeleteAgreementId(row.id)}
                      aria-label={t("deleteAction")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </TableShell>
      </TableCard>

      <Modal
        isOpen={model.isCreateModalOpen}
        onClose={() => model.setIsCreateModalOpen(false)}
        title={t("createTitle")}
        maxWidth="max-w-md"
      >
        <form onSubmit={model.onCreateAgreement} className="space-y-4 pt-4">
          <Field label={""} error={tError(createState.errors.name?.message)}>
            <FloatingInput
              required
              label={t("namePlaceholder")}
              {...registerCreate("name")}
            />
          </Field>
          <div className="flex items-center pt-2">
            <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...registerCreate("active")}
              />
              {t("activeLabel")}
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => model.setIsCreateModalOpen(false)}
              disabled={createState.isSubmitting}
            >
              {common("cancel")}
            </Button>
            <Button type="submit" isLoading={createState.isSubmitting}>
              {common("save")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={model.isEditModalOpen}
        onClose={() => model.setIsEditModalOpen(false)}
        title={t("editTitle")}
        maxWidth="max-w-md"
      >
        <form onSubmit={model.onUpdateAgreement} className="space-y-4 pt-4">
          <Field label={""} error={tError(formState.errors.name?.message)}>
            <FloatingInput
              required
              label={t("namePlaceholder")}
              {...register("name")}
            />
          </Field>
          <div className="flex items-center pt-2">
            <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...register("active")}
              />
              {t("activeLabel")}
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => model.setIsEditModalOpen(false)}
              disabled={formState.isSubmitting}
            >
              {common("cancel")}
            </Button>
            <Button type="submit" isLoading={formState.isSubmitting}>
              {common("save")}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={model.pendingDeleteAgreementId !== null}
        onClose={() => model.setPendingDeleteAgreementId(null)}
        onConfirm={async () => {
          if (!model.pendingDeleteAgreementId) return;
          await model.deleteAgreement(model.pendingDeleteAgreementId);
          model.setPendingDeleteAgreementId(null);
        }}
        title={common("confirmDeleteTitle")}
        message={t("confirmDelete")}
        hint={common("irreversibleAction")}
        cancelLabel={common("cancel")}
        confirmLabel={common("confirm")}
      />
    </div>
  );
}
