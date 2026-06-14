"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { OrganizationType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  useCreateOrganizationForm,
  useEditOrganizationForm,
} from "../hooks/use-organization-form";

interface OrganizationRow {
  id: string;
  name: string;
  type: OrganizationType;
  cnpj: string | null;
  phone: string | null;
  agreements?: Array<{ agreementId: string }>;
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
  const [allAgreements, setAllAgreements] = useState<
    Array<{ id: string; name: string }>
  >([]);
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
      toast.error(tError(await extractErrorKey(response)) ?? "");
      setIsLoading(false);
      return;
    }
    setRows((await response.json()) as OrganizationRow[]);
    setIsLoading(false);
  }, [type, tError, toast]);

  useEffect(() => {
    void load();
    if (type === "CLINICA") {
      fetch("/api/agreements?active=true")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllAgreements(data);
          }
        })
        .catch((err) => console.error("Failed to fetch agreements", err));
    }
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
      toast.error(tError(await extractErrorKey(response)) ?? "");
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
      toast.error(tError(await extractErrorKey(response)) ?? "");
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
      toast.error(tError(await extractErrorKey(response)) ?? "");
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
          className="space-y-6"
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
        >
          <div>
            <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-medium text-gray-900">
              {t("orgSectionTitle")}
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
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
            </div>

            {type === "CLINICA" && allAgreements.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Convênios Aceitos
                </h4>
                <div className="grid grid-cols-2 gap-2 rounded-md border bg-white p-3 md:grid-cols-3">
                  {allAgreements.map((agreement) => (
                    <label
                      key={agreement.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        value={agreement.id}
                        checked={
                          createForm
                            .watch("agreementIds")
                            ?.includes(agreement.id) || false
                        }
                        onChange={(e) => {
                          const current =
                            createForm.getValues("agreementIds") || [];
                          if (e.target.checked) {
                            createForm.setValue("agreementIds", [
                              ...current,
                              agreement.id,
                            ]);
                          } else {
                            createForm.setValue(
                              "agreementIds",
                              current.filter((id) => id !== agreement.id),
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {agreement.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-medium text-gray-900">
              {t("adminSectionTitle")}
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
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
                error={tError(
                  createForm.formState.errors.adminPassword?.message,
                )}
              >
                <FloatingInput
                  required
                  type="password"
                  label={t("adminPasswordPlaceholder")}
                  {...createForm.register("adminPassword")}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center pt-2">
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
          allAgreements={allAgreements}
          type={type}
        />
      )}

      {selectedOrgId && (
        <UsersModal
          organizationId={selectedOrgId}
          organizationName={
            rows.find((row) => row.id === selectedOrgId)?.name ?? ""
          }
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
  allAgreements,
  type,
}: {
  organization: OrganizationRow;
  onClose: () => void;
  onSuccess: () => void;
  t: any;
  tError: any;
  common: any;
  allAgreements: Array<{ id: string; name: string }>;
  type: OrganizationType;
}) {
  const { form, onSubmit, isSubmitting } = useEditOrganizationForm(
    organization.id,
    {
      name: organization.name,
      cnpj: organization.cnpj ?? "",
      phone: organization.phone ?? "",
      agreementIds: organization.agreements?.map((a) => a.agreementId) ?? [],
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

        {type === "CLINICA" && allAgreements.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Convênios Aceitos
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-md border bg-white p-3">
              {allAgreements.map((agreement) => (
                <label
                  key={agreement.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    value={agreement.id}
                    checked={
                      form.watch("agreementIds")?.includes(agreement.id) ||
                      false
                    }
                    onChange={(e) => {
                      const current = form.getValues("agreementIds") || [];
                      if (e.target.checked) {
                        form.setValue("agreementIds", [
                          ...current,
                          agreement.id,
                        ]);
                      } else {
                        form.setValue(
                          "agreementIds",
                          current.filter((id) => id !== agreement.id),
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  {agreement.name}
                </label>
              ))}
            </div>
          </div>
        )}

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
  organizationName,
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
  organizationName: string;
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
  const commonUsers = useTranslations("adminGlobal.users");
  const toast = useAppToast();
  const role = type === "CLINICA" ? "MEDICO" : "PROFISSIONAL";

  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "errors.required"),
        email: z.string().email("errors.invalidEmail"),
        password: editingUser
          ? z
              .string()
              .min(8, "errors.passwordTooShort")
              .optional()
              .or(z.literal(""))
          : z.string().min(8, "errors.passwordTooShort"),
        isAdmin: z.boolean().default(false),
      }),
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isAdmin: false,
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        isAdmin: editingUser.isAdmin,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        isAdmin: false,
      });
    }
  }, [editingUser, form]);

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const payload: any = {
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        };
        if (data.password) {
          payload.password = data.password;
        }

        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorKey = "errors.genericRequestFailed";
          try {
            const body = await response.json();
            if (body.error) errorKey = body.error;
          } catch {}
          toast.error(tError(errorKey));
          return;
        }

        toast.success("Usuário atualizado com sucesso!");
        setEditingUser(null);
      } else {
        const response = await fetch(
          `/api/organizations/${organizationId}/users`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, role }),
          },
        );

        if (!response.ok) {
          let errorKey = "errors.genericRequestFailed";
          try {
            const body = await response.json();
            if (body.error) errorKey = body.error;
          } catch {}
          toast.error(tError(errorKey));
          return;
        }

        toast.success("Usuário criado com sucesso!");
      }

      form.reset({
        name: "",
        email: "",
        password: "",
        isAdmin: false,
      });
      await onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("usersModalTitle", { name: organizationName })}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 pt-4">
        <div className="rounded-md border bg-gray-50 p-4">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">
            {editingUser
              ? `Editar usuário: ${editingUser.name}`
              : commonUsers("createTitle")}
          </h4>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={""}
                error={tError(form.formState.errors.name?.message)}
              >
                <FloatingInput
                  required
                  label={commonUsers("namePlaceholder")}
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
                  label={commonUsers("emailPlaceholder")}
                  {...form.register("email")}
                />
              </Field>

              <Field
                label={""}
                error={tError(form.formState.errors.password?.message)}
              >
                <FloatingInput
                  required={!editingUser}
                  type="password"
                  label={
                    editingUser
                      ? commonUsers("newPasswordPlaceholder")
                      : commonUsers("passwordPlaceholder")
                  }
                  {...form.register("password")}
                />
              </Field>

              <div className="flex items-center pt-2">
                <label className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...form.register("isAdmin")}
                  />
                  {commonUsers("isAdminLabel")}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingUser && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancelar Edição
                </Button>
              )}
              <Button type="submit" isLoading={isSubmitting}>
                {editingUser
                  ? "Salvar Alterações"
                  : commonUsers("createAction")}
              </Button>
            </div>
          </form>
        </div>

        <TableShell
          columns={
            <tr>
              <th className="px-4 py-2">{commonUsers("colName")}</th>
              <th className="px-4 py-2">{commonUsers("colEmail")}</th>
              <th className="px-4 py-2">{commonUsers("colAdmin")}</th>
              <th className="px-4 py-2 text-right">
                {commonUsers("colActions")}
              </th>
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
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      {commonUsers("editAction")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      {t("deleteUserAction")}
                    </Button>
                  </div>
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
