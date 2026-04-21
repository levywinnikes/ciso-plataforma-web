import { getRequestConfig } from "next-intl/server";

import { resolveLocale } from "./config";

export default getRequestConfig(async ({ locale }) => ({
  locale: resolveLocale(locale) as "pt-BR" | "en-US",
  messages: (
    await import(
      `./messages/${resolveLocale(locale) === "pt-BR" ? "pt-BR" : "en-US"}.json`
    )
  ).default,
}));
