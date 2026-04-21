import { forwardRef, InputHTMLAttributes } from "react";

interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function formatDateInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ error, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = formatDateInput(e.target.value);
      props.onChange?.(e);
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        {...props}
        onChange={handleChange}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""} ${className || ""} `}
      />
    );
  },
);

DateInput.displayName = "DateInput";
