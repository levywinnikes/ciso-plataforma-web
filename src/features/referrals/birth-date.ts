import { z } from "zod";

const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

export function maskBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isValidBirthDateInput(value: string): boolean {
  const match = BR_DATE.exec(value.trim());
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  if (year < 1900) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

/** Converte ISO (API) ou dd/mm/aaaa para o valor digitável do formulário. */
export function toBirthDateInputValue(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (BR_DATE.test(trimmed)) return trimmed;

  const iso = ISO_DATE.exec(trimmed.slice(0, 10));
  if (!iso) return trimmed;

  return `${iso[3]}/${iso[2]}/${iso[1]}`;
}

/** Aceita dd/mm/aaaa ou ISO YYYY-MM-DD. Recusa pedaço de data ("10", "10/01"). */
export function parseBirthDateOrNull(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (BR_DATE.test(trimmed)) {
    if (!isValidBirthDateInput(trimmed)) return null;
    const [day, month, year] = trimmed.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  const iso = ISO_DATE.exec(trimmed.slice(0, 10));
  if (!iso) return null;

  const br = `${iso[3]}/${iso[2]}/${iso[1]}`;
  if (!isValidBirthDateInput(br)) return null;
  return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
}

export function parseBirthDate(value: string): Date {
  return parseBirthDateOrNull(value) ?? new Date(NaN);
}

export const birthDateSchema = z
  .string()
  .min(1, "errors.birthDateRequired")
  .refine(isValidBirthDateInput, "errors.birthDateInvalid");
