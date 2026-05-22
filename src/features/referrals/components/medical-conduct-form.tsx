"use client";

import { FileText, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { Textarea } from "@/components/ui";

interface MedicalConductFormProps {
  notes: string;
  onNotesChange: (value: string) => void;
  conduct: string;
  onConductChange: (value: string) => void;
  files: string[];
  onAddFile: () => void;
}

export function MedicalConductForm({
  notes,
  onNotesChange,
  conduct,
  onConductChange,
  files,
  onAddFile,
}: MedicalConductFormProps) {
  const t = useTranslations("medicalConduct");
  return (
    <div className="space-y-5 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5">
      <h4 className="mb-2 flex items-center text-sm font-bold uppercase tracking-wider text-primary">
        <FileText className="mr-2 h-4 w-4" />
        {t("title")}
      </h4>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-700">
          {t("notesLabel")}
        </label>
        <Textarea
          placeholder={t("notesPlaceholder")}
          className="min-h-[120px] border-gray-300 shadow-sm focus:border-primary"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
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
        />
      </div>

      <div className="pt-2">
        <label className="mb-2 block text-xs font-bold uppercase text-gray-700">
          {t("attachmentsLabel")}
        </label>
        <button
          type="button"
          onClick={onAddFile}
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-5 transition-colors hover:bg-gray-50"
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
