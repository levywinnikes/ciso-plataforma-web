import "@testing-library/jest-dom";

import ptBR from "./src/i18n/messages/pt-BR.json";

// Helper to resolve nested keys like "login.emailPlaceholder"
function getTranslation(key: string): any {
  const parts = key.split(".");
  let current: any = ptBR;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

// Mock next-intl to prevent ESM export syntax errors in Jest environment
jest.mock("next-intl", () => ({
  useTranslations:
    (namespace?: string) => (key: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      let val = getTranslation(fullKey) || getTranslation(key) || key;
      if (typeof val !== "string") val = String(val);
      if (values && Object.keys(values).length > 0) {
        Object.entries(values).forEach(([k, v]) => {
          val = val.replace(`{${k}}`, String(v));
        });
      }
      return val;
    },
  useFormatter: () => ({
    number: (val: number) => String(val),
    dateTime: (val: Date) => val.toISOString(),
  }),
}));

// Mock global fetch to prevent fetch is not defined ReferenceErrors in Node.js test environment
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }),
);
