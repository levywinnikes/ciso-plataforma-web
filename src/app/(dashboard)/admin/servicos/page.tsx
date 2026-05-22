"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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
import { formatCurrency } from "@/features/referrals/utils";

interface ServiceRow {
  id: string;
  name: string;
  basePrice: number;
  nucleusId: string;
  nucleusName: string;
}

interface NucleusOption {
  id: string;
  name: string;
}

export default function AdminServicesPage() {
  const t = useTranslations("adminGlobal.services");
  const common = useTranslations("common");

  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [nuclei, setNuclei] = useState<NucleusOption[]>([]);
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [nucleusId, setNucleusId] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [pendingDeleteServiceId, setPendingDeleteServiceId] = useState<
    string | null
  >(null);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.nucleusName.toLowerCase().includes(term),
    );
  }, [rows, search]);

  async function loadData() {
    const [servicesRes, nucleiRes] = await Promise.all([
      fetch("/api/nuclei/services", { cache: "no-store" }),
      fetch("/api/nuclei", { cache: "no-store" }),
    ]);

    if (servicesRes.ok) {
      setRows((await servicesRes.json()) as ServiceRow[]);
    }

    if (nucleiRes.ok) {
      const nucleiData = (await nucleiRes.json()) as Array<{
        id: string;
        name: string;
      }>;
      setNuclei(nucleiData.map((item) => ({ id: item.id, name: item.name })));
      if (!nucleusId && nucleiData.length > 0) {
        setNucleusId(nucleiData[0].id);
      }
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createService() {
    const response = await fetch("/api/nuclei/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nucleusId,
        name,
        basePrice: Number(basePrice),
      }),
    });

    if (!response.ok) return;

    setName("");
    setBasePrice("");
    setIsCreateModalOpen(false);
    await loadData();
  }

  function openEditModal(row: ServiceRow) {
    setEditingId(row.id);
    setEditingName(row.name);
    setEditingPrice(String(row.basePrice));
    setIsEditModalOpen(true);
  }

  async function updateService() {
    const response = await fetch(`/api/nuclei/services/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingName,
        basePrice: Number(editingPrice),
      }),
    });

    if (!response.ok) return;

    setIsEditModalOpen(false);
    await loadData();
  }

  async function deleteService(id: string) {
    await fetch(`/api/nuclei/services/${id}`, { method: "DELETE" });
    await loadData();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            {t("newService")}
          </Button>
        }
      />

      <CardSection title={t("searchTitle")}>
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </CardSection>

      <TableCard title={t("listTitle")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{t("colName")}</th>
              <th className="px-6 py-3">{t("colNucleus")}</th>
              <th className="px-6 py-3">{t("colPrice")}</th>
              <th className="px-6 py-3 text-right">{t("colActions")}</th>
            </tr>
          }
        >
          {filteredRows.map((row) => (
            <tr key={row.id} className="ui-table-row">
              <td className="ui-table-cell font-medium text-gray-900">
                {row.name}
              </td>
              <td className="ui-table-cell">{row.nucleusName}</td>
              <td className="ui-table-cell">{formatCurrency(row.basePrice)}</td>
              <td className="ui-table-cell text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => openEditModal(row)}
                    aria-label={t("editAction")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2 text-red-600 hover:bg-red-50"
                    onClick={() => setPendingDeleteServiceId(row.id)}
                    aria-label={t("deleteAction")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      </TableCard>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t("newService")}
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <Input
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            placeholder={t("pricePlaceholder")}
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
          />
          <select
            className="ui-field"
            value={nucleusId}
            onChange={(event) => setNucleusId(event.target.value)}
          >
            {nuclei.map((nucleus) => (
              <option key={nucleus.id} value={nucleus.id}>
                {nucleus.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button type="button" onClick={createService}>
              {common("save")}
            </Button>
          </div>
        </div>
      </Modal>

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
            type="number"
            step="0.01"
            placeholder={t("pricePlaceholder")}
            value={editingPrice}
            onChange={(event) => setEditingPrice(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button type="button" onClick={updateService}>
              {common("save")}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDeleteServiceId !== null}
        onClose={() => setPendingDeleteServiceId(null)}
        onConfirm={async () => {
          if (!pendingDeleteServiceId) return;
          await deleteService(pendingDeleteServiceId);
          setPendingDeleteServiceId(null);
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
