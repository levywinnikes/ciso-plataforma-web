import { NextResponse } from "next/server";

import { runAssistantConsulta } from "@/features/assistant/consulta-engine";
import { assistantQueryRequestSchema } from "@/features/assistant/consulta-schema";
import { apiError, requireAdministrativo } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  return NextResponse.json({
    assunto: ["encaminhamentos", "financeiro", "cadastros"],
    medir: ["quantidade", "receita"],
    quebrarPor: [
      "situacao",
      "nucleo",
      "clinica",
      "consultorio",
      "mes",
      "papel",
      "tipo",
    ],
  });
}

export async function POST(request: Request) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = assistantQueryRequestSchema.safeParse(body ?? {});
  if (!parsed.success || !parsed.data.consulta) {
    return apiError("errors.invalidAssistantQuery", 400);
  }

  try {
    const resultado = await runAssistantConsulta(parsed.data.consulta);
    return NextResponse.json(resultado);
  } catch {
    return apiError("errors.assistantUnavailable", 503);
  }
}
