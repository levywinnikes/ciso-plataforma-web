"use client";

import { useTranslations } from "next-intl";

/**
 * Hook utilitario para traduzir mensagens de erro de schemas Zod
 * que utilizam chaves i18n (ex: "errors.required").
 *
 * Uso:
 * ```tsx
 * const tError = useFormError();
 * <FormField error={tError(errors.name?.message)} />
 * ```
 *
 * Documentacao: docs/ai/patterns.md (secao i18n em schemas).
 */
export function useFormError() {
  const t = useTranslations();
  return (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    if (!key.includes(".")) return key;
    try {
      return t(key);
    } catch {
      return key;
    }
  };
}
