"use client";

import { OrganizationType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  CardSection,
  ConfirmDialog,
  Input,
  Modal,
  PageHeader,
  TableCard,
  TableShell,
} from "@/components/ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

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
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pendingDeleteOrganizationId, setPendingDeleteOrganizationId] =
    useState<string | null>(null);
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingCnpj, setEditingCnpj] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  async function extractErrorKey(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { error?: string };
      return body.error ?? "errors.genericRequestFailed";
    } catch {
      return "errors.genericRequestFailed";
    }
  }

  const load = useCallback(async () => {
    const response = await fetch(`/api/organizations?type=${type}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      return;
    }
    setRows((await response.json()) as OrganizationRow[]);
  }, [type, tError, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createOrganization() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          cnpj,
          phone,
          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      if (!response.ok) {
        toast.error(tError(await extractErrorKey(response)));
        return;
      }

      setName("");
      setCnpj("");
      setPhone("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      toast.success(t("createSuccess"));
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteOrganization(id: string) {
    const response = await fetch(`/api/organizations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      return;
    }
    await load();
  }

  async function loadUsers(organizationId: string) {
    const response = await fetch(`/api/organizations/${organizationId}/users`, {
      cache: "no-store",
    });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      return;
    }
    setUsers((await response.json()) as UserRow[]);
  }

  function openUsersModal(organizationId: string) {
    setSelectedOrgId(organizationId);
    setIsUsersModalOpen(true);
    void loadUsers(organizationId);
  }

  async function deleteUser(userId: string) {
    const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error(tError(await extractErrorKey(response)));
      return;
    }
    if (selectedOrgId) {
      await loadUsers(selectedOrgId);
      await load();
    }
  }

  async function createUser() {
    if (!selectedOrgId) return;
    setIsCreatingUser(true);
    try {
      const role = type === "CLINICA" ? "MEDICO" : "PROFISSIONAL";
      const response = await fetch(
        `/api/organizations/${selectedOrgId}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            isAdmin: newUserIsAdmin,
            role,
          }),
        },
      );

      if (!response.ok) {
        toast.error(tError(await extractErrorKey(response)));
        return;
      }

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserIsAdmin(false);
      toast.success(t("createUserSuccess"));
      await loadUsers(selectedOrgId);
      await load();
    } finally {
      setIsCreatingUser(false);
    }
  }

  function openEditModal(row: OrganizationRow) {
    setEditingId(row.id);
    setEditingName(row.name);
    setEditingCnpj(row.cnpj ?? "");
    setEditingPhone(row.phone ?? "");
    setIsEditModalOpen(true);
  }

  async function updateOrganization() {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingName,
          cnpj: editingCnpj,
          phone: editingPhone,
        }),
      });

      if (!response.ok) {
        toast.error(tError(await extractErrorKey(response)));
        return;
      }

      setIsEditModalOpen(false);
      toast.success(t("updateSuccess"));
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <CardSection title={t("createTitle")}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            placeholder={t("cnpjPlaceholder")}
            value={cnpj}
            onChange={(event) => setCnpj(event.target.value)}
          />
          <Input
            placeholder={t("phonePlaceholder")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Input
            placeholder={t("adminNamePlaceholder")}
            value={adminName}
            onChange={(event) => setAdminName(event.target.value)}
          />
          <Input
            type="email"
            placeholder={t("adminEmailPlaceholder")}
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
          />
          <Input
            type="password"
            placeholder={t("adminPasswordPlaceholder")}
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
          />
          <Button
            type="button"
            onClick={createOrganization}
            disabled={isSubmitting}
          >
            {isSubmitting ? common("saving") : t("createAction")}
          </Button>
        </div>
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
          {rows.map((row) => (
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
                    onClick={() => openEditModal(row)}
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
          ))}
        </TableShell>
      </TableCard>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("editTitle")}
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <Input
            placeholder={t("namePlaceholder")}
            value={editingName}
            onChange={(event) => setEditingName(event.target.value)}
          />
          <Input
            placeholder={t("cnpjPlaceholder")}
            value={editingCnpj}
            onChange={(event) => setEditingCnpj(event.target.value)}
          />
          <Input
            placeholder={t("phonePlaceholder")}
            value={editingPhone}
            onChange={(event) => setEditingPhone(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button
              type="button"
              onClick={updateOrganization}
              disabled={isSubmitting}
            >
              {isSubmitting ? common("saving") : common("save")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        title={t("usersModalTitle")}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="mb-6 rounded-md border bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              {t("createTitle")}
            </h4>
            <div className="grid items-end gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Input
                placeholder={t("namePlaceholder")}
                value={newUserName}
                onChange={(event) => setNewUserName(event.target.value)}
              />
              <Input
                type="email"
                placeholder={t("adminEmailPlaceholder")}
                value={newUserEmail}
                onChange={(event) => setNewUserEmail(event.target.value)}
              />
              <Input
                type="password"
                placeholder={t("adminPasswordPlaceholder")}
                value={newUserPassword}
                onChange={(event) => setNewUserPassword(event.target.value)}
              />
              <div className="flex gap-2">
                <label className="mb-2 flex w-full items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newUserIsAdmin}
                    onChange={(event) =>
                      setNewUserIsAdmin(event.target.checked)
                    }
                  />
                  Admin Local
                </label>
                <Button
                  type="button"
                  onClick={createUser}
                  disabled={isCreatingUser}
                  className="whitespace-nowrap"
                >
                  {isCreatingUser ? common("saving") : t("createAction")}
                </Button>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-gray-500">{t("noUsersFound")}</p>
          ) : (
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
              {users.map((user) => (
                <tr key={user.id} className="ui-table-row text-sm">
                  <td className="ui-table-cell">{user.name}</td>
                  <td className="ui-table-cell">{user.email}</td>
                  <td className="ui-table-cell">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        user.isAdmin
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
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
                      onClick={() => setPendingDeleteUserId(user.id)}
                    >
                      {t("deleteUserAction")}
                    </Button>
                  </td>
                </tr>
              ))}
            </TableShell>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUsersModalOpen(false)}
            >
              {common("cancel")}
            </Button>
          </div>
        </div>
      </Modal>

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
