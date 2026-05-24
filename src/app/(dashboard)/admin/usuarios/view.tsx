"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  ConfirmDialog,
  FloatingInput,
  PageHeader,
  TableCard,
  TableShell,
} from "@/components/ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import { useAdminUsersForm } from "./hooks";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export function AdminUsersView() {
  const t = useTranslations("adminGlobal.users");
  const common = useTranslations("common");
  const tError = useFormError();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(
    null,
  );
  const toast = useAppToast();

  async function extractErrorKey(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? "errors.genericRequestFailed";
    } catch {
      return "errors.genericRequestFailed";
    }
  }

  async function loadUsers() {
    const response = await fetch("/api/users/globals", {
      cache: "no-store",
    });
    if (!response.ok) {
      toast.error(await extractErrorKey(response));
      return;
    }
    setRows((await response.json()) as UserRow[]);
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { form, onSubmit, isSubmitting } = useAdminUsersForm(loadUsers);

  async function deleteUser(id: string) {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error(await extractErrorKey(response));
      return;
    }
    toast.success("Usuário excluído com sucesso!");
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <CardSection title={t("createTitle")}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Field label={""} error={tError(form.formState.errors.name?.message)}>
            <FloatingInput
              label={t("namePlaceholder")}
              {...form.register("name")}
            />
          </Field>

          <Field
            label={""}
            error={tError(form.formState.errors.email?.message)}
          >
            <FloatingInput
              type="email"
              label={t("emailPlaceholder")}
              {...form.register("email")}
            />
          </Field>

          <Field
            label={""}
            error={tError(form.formState.errors.password?.message)}
          >
            <FloatingInput
              type="password"
              label={t("passwordPlaceholder")}
              {...form.register("password")}
            />
          </Field>

          <div className="flex h-14 items-center">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? common("saving") : t("createAction")}
            </Button>
          </div>
        </form>
      </CardSection>

      <TableCard title={t("listTitle")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{t("colName")}</th>
              <th className="px-6 py-3">{t("colEmail")}</th>
              <th className="px-6 py-3">{t("colRole")}</th>
              <th className="px-6 py-3 text-right">{t("colActions")}</th>
            </tr>
          }
        >
          {rows.map((row) => (
            <tr key={row.id} className="ui-table-row">
              <td className="ui-table-cell font-medium text-gray-900">
                {row.name}
              </td>
              <td className="ui-table-cell">{row.email}</td>
              <td className="ui-table-cell">{row.role}</td>
              <td className="ui-table-cell text-right">
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setPendingDeleteUserId(row.id)}
                >
                  {t("deleteAction")}
                </Button>
              </td>
            </tr>
          ))}
        </TableShell>
      </TableCard>

      <ConfirmDialog
        isOpen={pendingDeleteUserId !== null}
        onClose={() => setPendingDeleteUserId(null)}
        onConfirm={async () => {
          if (!pendingDeleteUserId) return;
          await deleteUser(pendingDeleteUserId);
          setPendingDeleteUserId(null);
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
