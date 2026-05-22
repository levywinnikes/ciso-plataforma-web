"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  CardSection,
  ConfirmDialog,
  PageHeader,
  TableCard,
  TableShell,
} from "@/components/ui";

interface OrganizationOption {
  id: string;
  name: string;
  type: "CLINICA" | "PROFISSIONAL_GROUP";
}

interface AccessRow {
  id: string;
  professionalGroupId: string;
  professionalGroupName: string;
  clinicId: string;
  clinicName: string;
}

export default function AdminAccessPage() {
  const t = useTranslations("adminGlobal.access");
  const common = useTranslations("common");

  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [professionalGroupId, setProfessionalGroupId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [pendingDeleteAccessId, setPendingDeleteAccessId] = useState<
    string | null
  >(null);

  const groups = useMemo(
    () => organizations.filter((org) => org.type === "PROFISSIONAL_GROUP"),
    [organizations],
  );
  const clinics = useMemo(
    () => organizations.filter((org) => org.type === "CLINICA"),
    [organizations],
  );

  async function load() {
    const [orgRes, accessRes] = await Promise.all([
      fetch("/api/organizations", { cache: "no-store" }),
      fetch("/api/professional-access", { cache: "no-store" }),
    ]);

    if (orgRes.ok) {
      const orgData = (await orgRes.json()) as OrganizationOption[];
      setOrganizations(orgData);
      if (!professionalGroupId) {
        const firstGroup = orgData.find(
          (item) => item.type === "PROFISSIONAL_GROUP",
        );
        if (firstGroup) setProfessionalGroupId(firstGroup.id);
      }
      if (!clinicId) {
        const firstClinic = orgData.find((item) => item.type === "CLINICA");
        if (firstClinic) setClinicId(firstClinic.id);
      }
    }

    if (accessRes.ok) {
      setRows((await accessRes.json()) as AccessRow[]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createAccess() {
    if (!professionalGroupId || !clinicId) return;

    const response = await fetch("/api/professional-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalGroupId, clinicId }),
    });

    if (!response.ok) return;
    await load();
  }

  async function deleteAccess(id: string) {
    await fetch(`/api/professional-access/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <CardSection title={t("createTitle")}>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            className="ui-field"
            value={professionalGroupId}
            onChange={(event) => setProfessionalGroupId(event.target.value)}
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <select
            className="ui-field"
            value={clinicId}
            onChange={(event) => setClinicId(event.target.value)}
          >
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>

          <Button type="button" onClick={createAccess}>
            {t("createAction")}
          </Button>
        </div>
      </CardSection>

      <TableCard title={t("listTitle")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{t("colGroup")}</th>
              <th className="px-6 py-3">{t("colClinic")}</th>
              <th className="px-6 py-3 text-right">{t("colActions")}</th>
            </tr>
          }
        >
          {rows.map((row) => (
            <tr key={row.id} className="ui-table-row">
              <td className="ui-table-cell font-medium text-gray-900">
                {row.professionalGroupName}
              </td>
              <td className="ui-table-cell">{row.clinicName}</td>
              <td className="ui-table-cell text-right">
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setPendingDeleteAccessId(row.id)}
                >
                  {t("deleteAction")}
                </Button>
              </td>
            </tr>
          ))}
        </TableShell>
      </TableCard>

      <ConfirmDialog
        isOpen={pendingDeleteAccessId !== null}
        onClose={() => setPendingDeleteAccessId(null)}
        onConfirm={async () => {
          if (!pendingDeleteAccessId) return;
          await deleteAccess(pendingDeleteAccessId);
          setPendingDeleteAccessId(null);
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
