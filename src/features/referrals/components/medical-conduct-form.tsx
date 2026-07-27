"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { FileUploadArea, Input, Select, Textarea } from "@/components/ui";

interface Surgery {
  id: string;
  name: string;
  defaultPrice: number;
}

interface MedicalConductFile {
  id: string;
  name: string;
  url?: string;
}

interface MedicalConductFormProps {
  notes: string;
  onNotesChange: (value: string) => void;
  conduct: string;
  onConductChange: (value: string) => void;
  files: MedicalConductFile[];
  onSelectFiles: (files: File[]) => void;
  onRemoveFile?: (id: string) => void;
  isUploading?: boolean;
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
  onSelectFiles,
  onRemoveFile,
  isUploading = false,
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
        <FileUploadArea
          files={files}
          onSelectFiles={onSelectFiles}
          onRemoveFile={onRemoveFile}
          isUploading={isUploading}
          disabled={disabled}
          label={t("addAttachments")}
        />
      </div>
    </div>
  );
}
