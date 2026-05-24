"use client";

import { useTranslations } from "next-intl";
import { toast as sonnerToast } from "sonner";

/**
 * Hook para notificações (Toasts) integrado com o i18n.
 * Se a mensagem enviada for uma chave de tradução válida (ex: "errors.emailAlreadyExists"),
 * ele exibirá a mensagem traduzida.
 */
export function useAppToast() {
  const t = useTranslations();

  function translateMessage(key: string): string {
    if (!key.includes(".")) return key;
    try {
      return t(key);
    } catch {
      return key;
    }
  }

  return {
    success: (messageOrKey: string) =>
      sonnerToast.success(translateMessage(messageOrKey)),
    error: (messageOrKey: string) =>
      sonnerToast.error(translateMessage(messageOrKey)),
    info: (messageOrKey: string) =>
      sonnerToast.info(translateMessage(messageOrKey)),
    warning: (messageOrKey: string) =>
      sonnerToast.warning(translateMessage(messageOrKey)),
    message: (messageOrKey: string) =>
      sonnerToast(translateMessage(messageOrKey)),
  };
}
