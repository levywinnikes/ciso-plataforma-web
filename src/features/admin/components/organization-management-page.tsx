"use client";

import { OrganizationType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  ConfirmDialog,
  FloatingInput,
  Modal,
  PageHeader,
  Skeleton,
  TableCard,
  TableShell,
} from "@/components/ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import {
  useCreateLocalUserForm,
  useCreateOrganizationForm,
  useEditOrganizationForm,
} from "../hooks/use-organization-form";

interface OrganizationRow {
  id: string;
  name: string;
  type: OrganizationType;
  cnpj: string | null;
  phone: string | null;
  _count?: { users: number; referrals: number };
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

interface OrganizationManagementPageProps {
  type: OrganizationType;
  namespace: "adminGlobal.clinics" | "adminGlobal.professionalGroups";
}

export function OrganizationManagementPage({
  type,
  namespace,
}: OrganizationManagementPageProps) {
  const t = useTranslations(namespace);
  const common = useTranslations("common");
  const tError = useFormError();
  const toast = useAppToast();

  const [rows, setRows] = useState<OrganizationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pendingDeleteOrganizationId, setPendingDeleteOrganizationId] =
    useState<string | null>(null);

  const [editingOrg, setEditingOrg] = useState<OrganizationRow | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
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

  const load = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch(`/api/organizations?type=${type}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      setIsLoading(false);
      return;
    }
    setRows((await response.json()) as OrganizationRow[]);
    setIsLoading(false);
  }, [type, tError, toast]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    form: createForm,
    onSubmit: onCreateSubmit,
    isSubmitting: isCreating,
  } = useCreateOrganizationForm(type, load);

  async function deleteOrganization(id: string) {
    const response = await fetch(`/api/organizations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      return;
    }
    toast.success(
      type === "CLINICA"
        ? "Clínica excluída com sucesso!"
        : "Consultório excluído com sucesso!",
    );
    await load();
  }

  async function loadUsers(organizationId: string) {
    setIsUsersLoading(true);
    const response = await fetch(`/api/organizations/${organizationId}/users`, {
      cache: "no-store",
    });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      setIsUsersLoading(false);
      return;
    }
    setUsers((await response.json()) as UserRow[]);
    setIsUsersLoading(false);
  }

  function openUsersModal(organizationId: string) {
    setSelectedOrgId(organizationId);
    void loadUsers(organizationId);
  }

  async function deleteUser(userId: string) {
    const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      return;
    }
    toast.success("Usuário removido com sucesso!");
    if (selectedOrgId) {
      await loadUsers(selectedOrgId);
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <CardSection title={t("createTitle")}>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
        >
          <Field
            label={""}
            error={tError(createForm.formState.errors.name?.message)}
          >
            <FloatingInput
              required
              label={t("namePlaceholder")}
              {...createForm.register("name")}
            />
          </Field>

          <Field
            label={""}
            error={tError(createForm.formState.errors.cnpj?.message)}
          >
            <FloatingInput
              label={t("cnpjPlaceholder")}
              mask="cnpj"
              {...createForm.register("cnpj")}
            />
          </Field>

          <Field
            label={""}
            error={tError(createForm.formState.errors.phone?.message)}
          >
            <FloatingInput
              label={t("phonePlaceholder")}
              mask="phone"
              {...createForm.register("phone")}
            />
          </Field>

          <Field
            label={""}
            error={tError(createForm.formState.errors.adminName?.message)}
          >
            <FloatingInput
              required
              label={t("adminNamePlaceholder")}
              {...createForm.register("adminName")}
            />
          </Field>

          <Field
            label={""}
            error={tError(createForm.formState.errors.adminEmail?.message)}
          >
            <FloatingInput
              required
              type="email"
              label={t("adminEmailPlaceholder")}
              {...createForm.register("adminEmail")}
            />
          </Field>

          <Field
            label={""}
            error={tError(createForm.formState.errors.adminPassword?.message)}
          >
            <FloatingInput
              required
              type="password"
              label={t("adminPasswordPlaceholder")}
              {...createForm.register("adminPassword")}
            />
          </Field>

          <div className="mt-2 flex items-center md:col-span-2">
            <Button type="submit" isLoading={isCreating}>
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
              <th className="px-6 py-3">{t("colUsers")}</th>
              <th className="px-6 py-3">{t("colReferrals")}</th>
              <th className="px-6 py-3 text-right">{t("colActions")}</th>
            </tr>
          }
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <tr key={index} className="ui-table-row">
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="ui-table-cell">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-24" />
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
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="ui-table-row">
                <td className="ui-table-cell font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="ui-table-cell">{row._count?.users ?? 0}</td>
                <td className="ui-table-cell">{row._count?.referrals ?? 0}</td>
                <td className="ui-table-cell text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openUsersModal(row.id)}
                    >
                      {t("manageUsersAction")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingOrg(row)}
                    >
                      {t("editAction")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setPendingDeleteOrganizationId(row.id)}
                    >
                      {t("deleteAction")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </TableShell>
      </TableCard>

      {editingOrg && (
        <EditOrganizationModal
          organization={editingOrg}
          onClose={() => setEditingOrg(null)}
          onSuccess={() => {
            setEditingOrg(null);
            void load();
          }}
          t={t}
          tError={tError}
          common={common}
        />
      )}

      {selectedOrgId && (
        <UsersModal
          organizationId={selectedOrgId}
          type={type}
          users={users}
          isLoading={isUsersLoading}
          onClose={() => setSelectedOrgId(null)}
          onSuccess={() => {
            void loadUsers(selectedOrgId);
            void load();
          }}
          onDeleteUser={setPendingDeleteUserId}
          t={t}
          tError={tError}
          common={common}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDeleteUserId !== null}
        onClose={() => setPendingDeleteUserId(null)}
        onConfirm={async () => {
          if (!pendingDeleteUserId) return;
          await deleteUser(pendingDeleteUserId);
          setPendingDeleteUserId(null);
        }}
        title={common("confirmDeleteTitle")}
        message={t("confirmDeleteUser")}
        hint={common("irreversibleAction")}
        cancelLabel={common("cancel")}
        confirmLabel={common("confirm")}
      />

      <ConfirmDialog
        isOpen={pendingDeleteOrganizationId !== null}
        onClose={() => setPendingDeleteOrganizationId(null)}
        onConfirm={async () => {
          if (!pendingDeleteOrganizationId) return;
          await deleteOrganization(pendingDeleteOrganizationId);
          setPendingDeleteOrganizationId(null);
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

// --- SUBCOMPONENTS ---

function EditOrganizationModal({
  organization,
  onClose,
  onSuccess,
  t,
  tError,
  common,
}: {
  organization: OrganizationRow;
  onClose: () => void;
  onSuccess: () => void;
  t: any;
  tError: any;
  common: any;
}) {
  const { form, onSubmit, isSubmitting } = useEditOrganizationForm(
    organization.id,
    {
      name: organization.name,
      cnpj: organization.cnpj ?? "",
      phone: organization.phone ?? "",
    },
    onSuccess,
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("editTitle")}
      maxWidth="max-w-md"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Field label={""} error={tError(form.formState.errors.name?.message)}>
          <FloatingInput
            required
            label={t("namePlaceholder")}
            {...form.register("name")}
          />
        </Field>
        <Field label={""} error={tError(form.formState.errors.cnpj?.message)}>
          <FloatingInput
            label={t("cnpjPlaceholder")}
            mask="cnpj"
            {...form.register("cnpj")}
          />
        </Field>
        <Field label={""} error={tError(form.formState.errors.phone?.message)}>
          <FloatingInput
            label={t("phonePlaceholder")}
            mask="phone"
            {...form.register("phone")}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {common("cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {common("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function UsersModal({
  organizationId,
  type,
  users,
  isLoading,
  onClose,
  onSuccess,
  onDeleteUser,
  t,
  tError,
  common,
}: {
  organizationId: string;
  type: OrganizationType;
  users: UserRow[];
  isLoading: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDeleteUser: (id: string) => void;
  t: any;
  tError: any;
  common: any;
}) {
  const role = type === "CLINICA" ? "MEDICO" : "PROFISSIONAL";
  const { form, onSubmit, isSubmitting } = useCreateLocalUserForm(
    organizationId,
    role,
    onSuccess,
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("usersModalTitle")}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 pt-4">
        <div className="rounded-md border bg-gray-50 p-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">
            {t("createTitle")}
          </h4>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-4"
          >
            <Field
              label={""}
              error={tError(form.formState.errors.name?.message)}
            >
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
                label={t("adminEmailPlaceholder")}
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
                label={t("adminPasswordPlaceholder")}
                {...form.register("password")}
              />
            </Field>

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-white px-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  {...form.register("isAdmin")}
                />
                Admin Local
              </label>
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                {t("createAction")}
              </Button>
            </div>
          </form>
        </div>

        <TableShell
          columns={
            <tr>
              <th className="px-4 py-2">{t("colName")}</th>
              <th className="px-4 py-2">{t("colEmail")}</th>
              <th className="px-4 py-2">{t("colAdmin")}</th>
              <th className="px-4 py-2 text-right">{t("colActions")}</th>
            </tr>
          }
        >
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <tr key={index} className="ui-table-row">
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-6 w-12" />
                </td>
                <td className="ui-table-cell text-right">
                  <Skeleton className="ml-auto h-8 w-16" />
                </td>
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr className="ui-table-row">
              <td
                colSpan={4}
                className="ui-table-cell py-6 text-center text-sm text-gray-500"
              >
                {t("noUsersFound")}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="ui-table-row text-sm">
                <td className="ui-table-cell">{user.name}</td>
                <td className="ui-table-cell">{user.email}</td>
                <td className="ui-table-cell">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.isAdmin
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.isAdmin ? common("yes") : common("no")}
                  </span>
                </td>
                <td className="ui-table-cell text-right">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    {t("deleteUserAction")}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </TableShell>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {common("cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
