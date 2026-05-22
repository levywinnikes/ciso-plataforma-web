import { forwardRef, InputHTMLAttributes } from "react";

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * DateInput — campo de data padronizado do projeto.
 *
 * Valor interno (form / API): YYYY-MM-DD
 * Exibição: formato do locale do navegador/SO
 *   ex.: DD/MM/AAAA no pt-BR, MM/DD/YYYY no en-US
 *
 * Use sempre este componente para qualquer entrada de data.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      type="date"
      {...props}
      className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500${error ? "border-red-500" : ""}${className ? ` ${className}` : ""}`}
    />
  ),
);

DateInput.displayName = "DateInput";
