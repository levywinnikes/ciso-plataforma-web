"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  ConfirmDialog,
  Input,
  PageHeader,
  TableCard,
  TableShell,
} from "@/components/ui";
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

  async function extractErrorKey(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? "errors.genericRequestFailed";
    } catch {
      return "errors.genericRequestFailed";
    }
  }

  async function loadUsers() {
    setErrorMessage(null);
    const response = await fetch("/api/users/globals", {
      cache: "no-store",
    });
    if (!response.ok) {
      setErrorMessage(await extractErrorKey(response));
      return;
    }
    setRows((await response.json()) as UserRow[]);
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { form, onSubmit, isSubmitting, errorMessage, setErrorMessage } =
    useAdminUsersForm(loadUsers);

  async function deleteUser(id: string) {
    setErrorMessage(null);
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setErrorMessage(await extractErrorKey(response));
      return;
    }
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {errorMessage ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {tError(errorMessage)}
        </div>
      ) : null}

      <CardSection title={t("createTitle")}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Field label={""} error={tError(form.formState.errors.name?.message)}>
            <Input
              placeholder={t("namePlaceholder")}
              {...form.register("name")}
            />
          </Field>

          <Field
            label={""}
            error={tError(form.formState.errors.email?.message)}
          >
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              {...form.register("email")}
            />
          </Field>

          <Field
            label={""}
            error={tError(form.formState.errors.password?.message)}
          >
            <Input
              type="password"
              placeholder={t("passwordPlaceholder")}
              {...form.register("password")}
            />
          </Field>

          <div className="flex items-start pt-1">
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
