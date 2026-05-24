"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  ConfirmDialog,
  FloatingInput,
  Modal,
  OverlayLoader,
  PageHeader,
  Skeleton,
  TableCard,
  TableShell,
} from "@/components/ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import { useAdminUsersForm, useEditAdminUserForm } from "./hooks";

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
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(
    null,
  );
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
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
    setIsLoading(true);
    const response = await fetch("/api/users/organization", {
      cache: "no-store",
    });
    if (!response.ok) {
      toast.error(await extractErrorKey(response));
      setIsLoading(false);
      return;
    }
    setRows((await response.json()) as UserRow[]);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { form, onSubmit, isSubmitting } = useAdminUsersForm(loadUsers);

  async function deleteUser(id: string) {
    const response = await fetch(`/api/users/organization/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(await extractErrorKey(response));
      return;
    }
    toast.success("Usuário excluído com sucesso!");
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <CardSection title={t("createTitle")}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Field label={""} error={tError(form.formState.errors.name?.message)}>
            <FloatingInput
              required
              label={t("namePlaceholder")}
              {...form.register("name")}
            />
          </Field>

          <Field
            label={""}
            error={tError(form.formState.errors.email?.message)}
          >
            <FloatingInput
              required
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
              required
              type="password"
              label={t("passwordPlaceholder")}
              {...form.register("password")}
            />
          </Field>

          <div className="flex h-14 items-center">
            <Button type="submit" isLoading={isSubmitting}>
              {t("createAction")}
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="ui-table-row">
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-48" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="ui-table-cell">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr className="ui-table-row">
              <td
                colSpan={4}
                className="ui-table-cell py-8 text-center text-gray-500"
              >
                Nenhum usuário encontrado
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="ui-table-row">
                <td className="ui-table-cell font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="ui-table-cell">{row.email}</td>
                <td className="ui-table-cell">{row.role}</td>
                <td className="ui-table-cell space-x-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser(row)}
                  >
                    {t("editAction")}
                  </Button>
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
            ))
          )}
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

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            void loadUsers();
          }}
          t={t}
          tError={tError}
          common={common}
        />
      )}
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSuccess,
  t,
  tError,
  common,
}: {
  user: UserRow;
  onClose: () => void;
  onSuccess: () => void;
  t: any;
  tError: any;
  common: any;
}) {
  const { form, onSubmit, isSubmitting } = useEditAdminUserForm(
    user.id,
    { name: user.name, email: user.email },
    onSuccess,
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={t("editTitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Field label={""} error={tError(form.formState.errors.name?.message)}>
          <FloatingInput
            required
            label={t("namePlaceholder")}
            {...form.register("name")}
          />
        </Field>

        <Field label={""} error={tError(form.formState.errors.email?.message)}>
          <FloatingInput
            required
            type="email"
            label={t("emailPlaceholder")}
            {...form.register("email")}
          />
        </Field>

        <div className="border-t border-gray-100 pt-4">
          <p className="mb-4 text-sm font-semibold text-gray-500">
            {t("passwordSection")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={""}
              error={tError(form.formState.errors.password?.message)}
            >
              <FloatingInput
                type="password"
                label={t("newPasswordPlaceholder")}
                {...form.register("password")}
              />
            </Field>

            <Field
              label={""}
              error={tError(form.formState.errors.confirmPassword?.message)}
            >
              <FloatingInput
                type="password"
                label={t("confirmPasswordPlaceholder")}
                {...form.register("confirmPassword")}
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {common("cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t("saveEditAction")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
