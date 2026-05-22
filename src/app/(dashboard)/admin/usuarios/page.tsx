"use client";

import { UserRole } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  CardSection,
  ConfirmDialog,
  Input,
  PageHeader,
  TableCard,
  TableShell,
} from "@/components/ui";

interface OrganizationOption {
  id: string;
  name: string;
  type: "CLINICA" | "PROFISSIONAL_GROUP";
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const t = useTranslations("adminGlobal.users");
  const common = useTranslations("common");

  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(
    null,
  );

  const selectedOrg = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId),
    [organizations, selectedOrgId],
  );

  const roleForOrg: UserRole =
    selectedOrg?.type === "CLINICA" ? "MEDICO" : "PROFISSIONAL";

  async function loadOrganizations() {
    const response = await fetch("/api/organizations", { cache: "no-store" });
    if (!response.ok) return;

    const data = (await response.json()) as OrganizationOption[];
    setOrganizations(data);
    if (!selectedOrgId && data.length > 0) {
      setSelectedOrgId(data[0].id);
    }
  }

  async function loadUsers(orgId: string) {
    if (!orgId) return;
    const response = await fetch(`/api/organizations/${orgId}/users`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    setRows((await response.json()) as UserRow[]);
  }

  useEffect(() => {
    void loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      void loadUsers(selectedOrgId);
    }
  }, [selectedOrgId]);

  async function createUser() {
    if (!selectedOrgId) return;

    const response = await fetch(`/api/organizations/${selectedOrgId}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: roleForOrg,
        isAdmin,
      }),
    });

    if (!response.ok) return;

    setName("");
    setEmail("");
    setPassword("");
    setIsAdmin(false);
    await loadUsers(selectedOrgId);
  }

  async function deleteUser(id: string) {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await loadUsers(selectedOrgId);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <CardSection title={t("scopeTitle")}>
        <select
          className="ui-field"
          value={selectedOrgId}
          onChange={(event) => setSelectedOrgId(event.target.value)}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.type})
            </option>
          ))}
        </select>
      </CardSection>

      <CardSection title={t("createTitle")}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(event) => setIsAdmin(event.target.checked)}
            />
            {t("isAdminLabel")}
          </label>
          <Button type="button" onClick={createUser}>
            {t("createAction")}
          </Button>
        </div>
      </CardSection>

      <TableCard title={t("listTitle")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{t("colName")}</th>
              <th className="px-6 py-3">{t("colEmail")}</th>
              <th className="px-6 py-3">{t("colRole")}</th>
              <th className="px-6 py-3">{t("colAdmin")}</th>
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
              <td className="ui-table-cell">
                {row.isAdmin ? t("yes") : t("no")}
              </td>
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
