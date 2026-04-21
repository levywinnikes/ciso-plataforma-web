import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "./utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full rounded-xl bg-white shadow-xl duration-200 animate-in fade-in zoom-in",
          maxWidth,
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-bold text-primary sm:text-lg">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
        {footer && (
          <div className="flex flex-col justify-end space-y-2 rounded-b-xl border-t bg-gray-50 px-4 py-3 sm:flex-row sm:space-x-3 sm:space-y-0 sm:px-6 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
