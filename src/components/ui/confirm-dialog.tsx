import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  hint?: string;
  variant?: "danger" | "warning" | "info";
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const tone = {
  danger: {
    panel:
      "border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50",
    orb: "bg-red-200/40",
    iconWrap: "bg-red-100 text-red-700 ring-red-200",
    confirmButton: "bg-red-600 text-white hover:bg-red-700",
    Icon: AlertTriangle,
  },
  warning: {
    panel:
      "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50",
    orb: "bg-amber-200/40",
    iconWrap: "bg-amber-100 text-amber-700 ring-amber-200",
    confirmButton: "bg-amber-600 text-white hover:bg-amber-700",
    Icon: AlertCircle,
  },
  info: {
    panel: "border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50",
    orb: "bg-sky-200/40",
    iconWrap: "bg-sky-100 text-sky-700 ring-sky-200",
    confirmButton: "bg-sky-600 text-white hover:bg-sky-700",
    Icon: Info,
  },
} as const;

export function ConfirmDialog({
  isOpen,
  title,
  message,
  cancelLabel,
  confirmLabel,
  hint,
  variant = "danger",
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const currentTone = tone[variant];
  const Icon = currentTone.Icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div
        className={`relative overflow-hidden rounded-xl border p-4 duration-300 animate-in fade-in zoom-in-95 ${currentTone.panel}`}
      >
        <div
          className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl ${currentTone.orb}`}
        />
        <div className="flex items-start gap-3 duration-500 animate-in slide-in-from-bottom-1">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${currentTone.iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">{message}</p>
            {hint ? <p className="text-xs text-gray-600">{hint}</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          className={currentTone.confirmButton}
          onClick={() => {
            void onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
