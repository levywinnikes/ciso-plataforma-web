import { z } from "zod";

export const ASSISTANT_ASSUNTOS = [
  "encaminhamentos",
  "financeiro",
  "cadastros",
] as const;

export const ASSISTANT_MEDIDAS = ["quantidade", "receita"] as const;

export const ASSISTANT_QUEBRAS = [
  "situacao",
  "nucleo",
  "clinica",
  "consultorio",
  "mes",
  "papel",
  "tipo",
] as const;

export const ASSISTANT_SITUACOES = [
  "Bloqueado",
  "Encaminhado",
  "Agendado",
  "Atendido",
] as const;

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "errors.invalidAssistantQuery" });

export const assistantConsultaSchema = z
  .object({
    assunto: z.enum(ASSISTANT_ASSUNTOS),
    medir: z
      .array(z.enum(ASSISTANT_MEDIDAS))
      .min(1)
      .max(2)
      .default(["quantidade"]),
    quebrarPor: z.array(z.enum(ASSISTANT_QUEBRAS)).max(2).default([]),
    filtros: z
      .object({
        situacao: z.array(z.enum(ASSISTANT_SITUACOES)).max(4).optional(),
        soAtrasados: z.boolean().optional(),
        inicio: dateKey.optional(),
        fim: dateKey.optional(),
        clinica: z.string().trim().min(1).max(120).optional(),
        consultorio: z.string().trim().min(1).max(120).optional(),
        nucleo: z.string().trim().min(1).max(120).optional(),
        incluirBloqueados: z.boolean().optional(),
      })
      .optional()
      .default({}),
  })
  .superRefine((value, ctx) => {
    if (value.medir.includes("receita") && value.assunto === "cadastros") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.invalidAssistantQuery",
      });
    }
    if (
      value.assunto !== "cadastros" &&
      value.quebrarPor.some((item) => item === "papel" || item === "tipo")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.invalidAssistantQuery",
      });
    }
  });

export type AssistantConsulta = z.infer<typeof assistantConsultaSchema>;

export const assistantQueryRequestSchema = z
  .object({
    consulta: assistantConsultaSchema.optional(),
  })
  .strict();

export const CONSULTA_INSTRUCTIONS = `
Quando a pergunta pedir número, comparação, recorte (período, clínica, consultório, núcleo, situação, atrasados) ou ranking de totais:
- NÃO invente.
- NÃO responda em texto ainda.
- Responda SOMENTE um JSON, sem markdown, neste formato:
{"consulta":{"assunto":"encaminhamentos","medir":["quantidade"],"quebrarPor":["situacao"],"filtros":{}}}

assunto: encaminhamentos | financeiro | cadastros
medir: quantidade e/ou receita (receita só em encaminhamentos ou financeiro)
quebrarPor: até 2 entre situacao, nucleo, clinica, consultorio, mes (cadastros: papel, tipo)
filtros opcionais: situacao (lista), soAtrasados (true), inicio e fim (AAAA-MM-DD), clinica, consultorio, nucleo (nomes), incluirBloqueados (financeiro por padrão NÃO inclui Bloqueado)

Se a pergunta for como usar o sistema, regras ou para qual tela ir: responda em linguagem de negócio, com atalho [Nome](tela:codigo). Não use JSON.

Você não lista pacientes nem profissionais. Só totais.
`.trim();
