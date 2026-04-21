import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  files: string[];
  onAddFile: () => void;
  label?: string;
}

export function FileUploadArea({
  files,
  onAddFile,
  label = "Incluir documentos",
}: FileUploadAreaProps) {
  return (
    <div>
      <button type="button" onClick={onAddFile} className="ui-upload-dropzone">
        <Upload className="h-4 w-4" />
        {label}
      </button>
      {files.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          {files.map((file) => (
            <li key={file} className="rounded border border-gray-200 px-3 py-2">
              {file}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
