"use client";

import { FileText, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Input, Select, Textarea } from "@/components/ui";

interface Surgery {
  id: string;
  name: string;
  defaultPrice: number;
}

interface MedicalConductFormProps {
  notes: string;
  onNotesChange: (value: string) => void;
  conduct: string;
  onConductChange: (value: string) => void;
  files: string[];
  onAddFile: () => void;
  surgeryId: string;
  onSurgeryIdChange: (value: string) => void;
  surgeryPrice: number | "";
  onSurgeryPriceChange: (value: number | "") => void;
  disabled?: boolean;
}

export function MedicalConductForm({
  notes,
  onNotesChange,
  conduct,
  onConductChange,
  files,
  onAddFile,
  surgeryId,
  onSurgeryIdChange,
  surgeryPrice,
  onSurgeryPriceChange,
  disabled = false,
}: MedicalConductFormProps) {
  const t = useTranslations("medicalConduct");
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);

  useEffect(() => {
    async function fetchSurgeries() {
      try {
        const res = await fetch("/api/surgeries?active=true");
        if (res.ok) {
          const data = (await res.json()) as Surgery[];
          setSurgeries(data);
        }
      } catch (e) {
        console.error("Failed to load surgeries:", e);
      }
    }
    void fetchSurgeries();
  }, []);

  const handleSurgeryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    onSurgeryIdChange(selectedId);
    if (selectedId) {
      const found = surgeries.find((s) => s.id === selectedId);
      if (found) {
        onSurgeryPriceChange(found.defaultPrice);
      }
    } else {
      onSurgeryPriceChange("");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onSurgeryPriceChange("");
    } else {
      const parsed = parseFloat(val);
      onSurgeryPriceChange(isNaN(parsed) ? "" : parsed);
    }
  };

  return (
    <div className="space-y-5 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5">
      <h4 className="mb-2 flex items-center text-sm font-bold uppercase tracking-wider text-primary">
        <FileText className="mr-2 h-4 w-4" />
        {t("title")}
      </h4>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-700">
          {t("surgeryLabel")}
        </label>
        <Select
          value={surgeryId}
          onChange={handleSurgeryChange}
          disabled={disabled}
          className="w-full border-gray-300 shadow-sm focus:border-primary"
        >
          <option value="">{t("selectSurgery")}</option>
          {surgeries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-700">
          {t("surgeryPriceLabel")}
        </label>
        <Input
          type="number"
          step="0.01"
          value={surgeryPrice}
          onChange={handlePriceChange}
          disabled={disabled || !surgeryId}
          placeholder="0.00"
          className="w-full border-gray-300 shadow-sm focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-700">
          {t("notesLabel")}
        </label>
        <Textarea
          placeholder={t("notesPlaceholder")}
          className="min-h-[120px] border-gray-300 shadow-sm focus:border-primary"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-700">
          {t("conductLabel")}
        </label>
        <Textarea
          placeholder={t("conductPlaceholder")}
          className="min-h-[120px] border-gray-300 shadow-sm focus:border-primary"
          value={conduct}
          onChange={(e) => onConductChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="pt-2">
        <label className="mb-2 block text-xs font-bold uppercase text-gray-700">
          {t("attachmentsLabel")}
        </label>
        <button
          type="button"
          onClick={disabled ? undefined : onAddFile}
          disabled={disabled}
          className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-5 transition-colors ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-50"
          }`}
        >
          <Upload className="mb-2 h-5 w-5 text-gray-400" />
          <p className="text-xs font-medium text-gray-600">
            {t("addAttachments")}
          </p>
        </button>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2 text-xs text-gray-600">
            {files.map((file) => (
              <li
                key={file}
                className="rounded border border-gray-200 bg-white px-3 py-2"
              >
                {file}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
