"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Field } from "@/components/forms/field";
import { Button, Textarea } from "@/components/ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import { AssistantReplyText } from "./assistant-reply-text";
import { useAssistantChatForm } from "./hooks";
import type { AssistantChatFormData } from "./schema";

const STORAGE_KEY = "integra-visao-assistant-thread";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function readStoredTurns(): ChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatTurn[];
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch {
    return [];
  }
}

export function AssistantWidget() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const t = useTranslations("assistant");
  const tError = useFormError();
  const toast = useAppToast();
  const locale = useLocale();
  const form = useAssistantChatForm();
  const listRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [ready, setReady] = useState(false);

  const isAdminSurface =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const canUse =
    status === "authenticated" &&
    session?.user?.role === "ADMINISTRATIVO" &&
    isAdminSurface;

  useEffect(() => {
    setTurns(readStoredTurns());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns.slice(-12)));
  }, [ready, turns]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, turns, isSending]);

  if (!canUse) {
    return null;
  }

  async function onSubmit(data: AssistantChatFormData) {
    const question = data.message.trim();
    setIsSending(true);
    setTurns((current) => [...current, { role: "user", content: question }]);
    form.reset({ message: "" });

    try {
      const response = await fetch("/api/admin/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          locale: locale === "en-US" ? "en-US" : "pt-BR",
          history: turns.slice(-12),
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !body.reply) {
        toast.error(tError(body.error ?? "errors.assistantUnavailable") ?? "");
        setTurns((current) => current.slice(0, -1));
        form.setValue("message", question);
        return;
      }

      setTurns((current) => [
        ...current,
        { role: "assistant", content: body.reply ?? "" },
      ]);
    } catch {
      toast.error(tError("errors.assistantUnavailable") ?? "");
      setTurns((current) => current.slice(0, -1));
      form.setValue("message", question);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen ? (
          <motion.section
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="pointer-events-auto flex h-[min(32rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_24px_80px_rgba(10,46,42,0.22)]"
          >
            <header className="relative overflow-hidden bg-gradient-to-br from-primary via-[#123f39] to-[#1a534b] px-5 pb-4 pt-4 text-white">
              <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-10 h-16 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-wide">
                      {t("title")}
                    </p>
                    <p className="text-xs text-white/75">{t("subtitle")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label={t("close")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-emerald-50/70 to-surface px-4 py-4"
            >
              {turns.length === 0 ? (
                <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-primary">
                    {t("emptyTitle")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {t("emptyBody")}
                  </p>
                </div>
              ) : null}

              {turns.map((turn, index) => (
                <div
                  key={`${turn.role}-${index}`}
                  className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      turn.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-md"
                        : "max-w-[85%] rounded-2xl rounded-bl-md border border-primary/10 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm"
                    }
                  >
                    {turn.role === "assistant" ? (
                      <AssistantReplyText content={turn.content} />
                    ) : (
                      turn.content
                    )}
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl border border-primary/10 bg-white px-3 py-2 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="border-t border-primary/10 bg-white/95 p-3"
            >
              <Field
                label=""
                error={tError(form.formState.errors.message?.message)}
              >
                <Textarea
                  rows={2}
                  placeholder={t("placeholder")}
                  className="min-h-[4.5rem] resize-none rounded-2xl border-primary/15 bg-white pr-12 text-sm shadow-inner focus:border-primary focus:ring-primary"
                  {...form.register("message")}
                />
              </Field>
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSending}
                  className="rounded-full bg-primary px-4 text-white shadow-md hover:bg-primary/90"
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  {t("send")}
                </Button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_30px_rgba(10,46,42,0.35)] ring-4 ring-emerald-100 transition hover:scale-105 hover:ring-emerald-200"
        aria-label={isOpen ? t("close") : t("open")}
        whileTap={{ scale: 0.96 }}
      >
        <span className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
        {isOpen ? (
          <X className="relative h-5 w-5" />
        ) : (
          <Sparkles className="relative h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
}
