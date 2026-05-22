import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, InputHTMLAttributes, useState } from "react";

import { cn } from "./utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const t = useTranslations("passwordInput");

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("ui-field pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          tabIndex={-1}
          aria-label={visible ? t("hide") : t("show")}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
