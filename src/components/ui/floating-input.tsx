"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, useState } from "react";

import { cn } from "./utils";

export interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  function FloatingInput({ className, label, type, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            "peer block h-14 w-full rounded-md border border-gray-300 bg-white px-3 pb-2 pt-6 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500",
            className,
          )}
          placeholder=" "
          {...props}
        />
        <label className="pointer-events-none absolute left-3 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary">
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
