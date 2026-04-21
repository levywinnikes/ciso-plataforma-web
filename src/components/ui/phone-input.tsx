import { forwardRef, InputHTMLAttributes } from "react";

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function formatPhoneInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 11);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 6) {
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.length <= 10) {
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`;
  }

  return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ error, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = formatPhoneInput(e.target.value);
      props.onChange?.(e);
    };

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        placeholder="(XX) XXXXX-XXXX"
        {...props}
        onChange={handleChange}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""} ${className || ""} `}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";
