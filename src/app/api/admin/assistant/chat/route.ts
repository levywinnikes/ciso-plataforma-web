import { NextResponse } from "next/server";

import { ASSISTANT_DAILY_LIMIT } from "@/features/assistant/constants";
import {
  extractConsultaFromText,
  formatConsultaResultForModel,
  runAssistantConsulta,
} from "@/features/assistant/consulta-engine";
import { CONSULTA_INSTRUCTIONS } from "@/features/assistant/consulta-schema";
import { loadAssistantManual } from "@/features/assistant/queries";
import { assistantChatRequestSchema } from "@/features/assistant/schema";
import { generateGeminiText } from "@/lib/ai/gemini";
import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;
  if (!auth.user.id) {
    return apiError("errors.unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = assistantChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("errors.invalidAssistantData", 400);
  }

  const day = todayKey();
  let usage: { count: number } | null = null;
  try {
    usage = await prisma.assistantDailyUsage.findUnique({
      where: {
        userId_day: { userId: auth.user.id, day },
      },
    });
  } catch {
    return apiError("errors.assistantUnavailable", 503);
  }

  if ((usage?.count ?? 0) >= ASSISTANT_DAILY_LIMIT) {
    return apiError("errors.assistantDailyLimit", 429);
  }

  const locale = parsed.data.locale === "en-US" ? "en-US" : "pt-BR";
  const historyBlock = (parsed.data.history ?? [])
    .map(
      (item) =>
        `${item.role === "user" ? "Administrador" : "Assistente"}: ${item.content}`,
    )
    .join("\n");

  const basePrompt = [
    await loadAssistantManual(),
    CONSULTA_INSTRUCTIONS,
    `Idioma da sessão: ${locale}.`,
    historyBlock ? `Conversa recente:\n${historyBlock}` : "",
    `Pergunta atual do administrador:\n${parsed.data.message}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    let reply = await generateGeminiText(basePrompt);
    const consulta = extractConsultaFromText(reply);
    const looksLikeConsulta = /"consulta"\s*:/.test(reply);

    if (consulta) {
      try {
        const resultado = await runAssistantConsulta(consulta);
        reply = await generateGeminiText(
          [
            await loadAssistantManual(),
            `Idioma da sessão: ${locale}.`,
            "Você já consultou os números. Responda em linguagem de negócio. Não use JSON. Não invente. Não liste pacientes.",
            formatConsultaResultForModel(
              resultado.linhas,
              resultado.incompleto,
              locale,
            ),
            historyBlock ? `Conversa recente:\n${historyBlock}` : "",
            `Pergunta atual do administrador:\n${parsed.data.message}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        );
      } catch {
        reply = await generateGeminiText(
          [
            await loadAssistantManual(),
            `Idioma da sessão: ${locale}.`,
            "Os números ao vivo não puderam ser lidos agora. Oriente pela tela, sem inventar totais.",
            `Pergunta atual do administrador:\n${parsed.data.message}`,
          ].join("\n\n"),
        );
      }
    } else if (looksLikeConsulta) {
      reply = await generateGeminiText(
        [
          await loadAssistantManual(),
          `Idioma da sessão: ${locale}.`,
          "A consulta não pôde ser lida. Responda em linguagem de negócio, sem JSON e sem inventar números. Se faltar recorte, peça.",
          `Pergunta atual do administrador:\n${parsed.data.message}`,
        ].join("\n\n"),
      );
    }

    await prisma.assistantDailyUsage.upsert({
      where: {
        userId_day: { userId: auth.user.id, day },
      },
      create: { userId: auth.user.id, day, count: 1 },
      update: { count: { increment: 1 } },
    });

    return NextResponse.json({
      reply,
      remaining: ASSISTANT_DAILY_LIMIT - ((usage?.count ?? 0) + 1),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "errors.assistantNotConfigured") {
      return apiError("errors.assistantNotConfigured", 503);
    }
    return apiError("errors.assistantUnavailable", 503);
  }
}
