export const locales = ["pt-BR", "en-US"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "pt-BR";

export function resolveLocale(candidate?: string): AppLocale {
  if (!candidate) {
    return defaultLocale;
  }

  return locales.includes(candidate as AppLocale)
    ? (candidate as AppLocale)
    : defaultLocale;
}
