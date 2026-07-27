"use client";

import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export interface FileUploadItem {
  id: string;
  name: string;
  url?: string;
}

interface FileUploadAreaProps {
  files: FileUploadItem[];
  onSelectFiles: (files: File[]) => void;
  onRemoveFile?: (id: string) => void;
  label?: string;
  disabled?: boolean;
  isUploading?: boolean;
  accept?: string;
}

export function FileUploadArea({
  files,
  onSelectFiles,
  onRemoveFile,
  label,
  disabled = false,
  isUploading = false,
  accept = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx",
}: FileUploadAreaProps) {
  const t = useTranslations("common");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept={accept}
        disabled={disabled || isUploading}
        onChange={(event) => {
          const selected = event.target.files
            ? Array.from(event.target.files)
            : [];
          if (selected.length > 0) {
            onSelectFiles(selected);
          }
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        className="ui-upload-dropzone"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? t("uploading") : (label ?? t("includeDocuments"))}
      </button>
      {files.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded border border-gray-200 px-3 py-2"
            >
              <span className="truncate">
                {file.url?.startsWith("http") ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {file.name}
                  </a>
                ) : (
                  file.name
                )}
              </span>
              {onRemoveFile ? (
                <button
                  type="button"
                  className="shrink-0 text-xs text-red-600 hover:underline"
                  onClick={() => onRemoveFile(file.id)}
                  disabled={disabled || isUploading}
                >
                  {t("remove")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
