import enUS from "@/i18n/messages/en-US.json";
import ptBR from "@/i18n/messages/pt-BR.json";

import type { AppLocale } from "./config";

const messagesByLocale = {
  "pt-BR": ptBR,
  "en-US": enUS,
} as const;

export function getMessages(locale: AppLocale) {
  return messagesByLocale[locale];
}
