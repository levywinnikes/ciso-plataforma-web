import type { ReferralStatus } from "@prisma/client";

export const BLOCK_JUSTIFICATION_MAX_LENGTH = 500;

export const PROFESSIONAL_EDITABLE_STATUSES: ReferralStatus[] = [
  "Encaminhado",
  "Bloqueado",
];

export function normalizeBlockJustification(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateBlockedStatusInput(input: {
  status: ReferralStatus;
  justificativaBloqueio: unknown;
  previousStatus?: ReferralStatus;
}):
  | { ok: true; justificativaBloqueio: string | null }
  | { ok: false; message: string } {
  if (input.previousStatus === "Atendido" && input.status === "Bloqueado") {
    return {
      ok: false,
      message: "Encaminhamentos concluídos não podem ser bloqueados.",
    };
  }

  if (input.status === "Bloqueado") {
    const justificativa = normalizeBlockJustification(
      input.justificativaBloqueio,
    );
    if (!justificativa) {
      return {
        ok: false,
        message: "Justificativa é obrigatória para status Bloqueado.",
      };
    }
    if (justificativa.length > BLOCK_JUSTIFICATION_MAX_LENGTH) {
      return {
        ok: false,
        message: `Justificativa deve ter no máximo ${BLOCK_JUSTIFICATION_MAX_LENGTH} caracteres.`,
      };
    }
    return { ok: true, justificativaBloqueio: justificativa };
  }

  return {
    ok: true,
    justificativaBloqueio: normalizeBlockJustification(
      input.justificativaBloqueio,
    ),
  };
}

export function resolveCreateStatus(input: {
  status?: unknown;
  justificativaBloqueio?: unknown;
}):
  | { ok: true; status: ReferralStatus; justificativaBloqueio: string | null }
  | { ok: false; message: string } {
  const requested: ReferralStatus | null =
    input.status === "Bloqueado" || input.status === "Encaminhado"
      ? input.status
      : input.status == null || input.status === ""
        ? "Encaminhado"
        : null;

  if (!requested) {
    return {
      ok: false,
      message: "Status inválido na criação. Use Encaminhado ou Bloqueado.",
    };
  }

  const validated = validateBlockedStatusInput({
    status: requested,
    justificativaBloqueio: input.justificativaBloqueio,
  });

  if (!validated.ok) {
    return validated;
  }

  return {
    ok: true,
    status: requested,
    justificativaBloqueio: validated.justificativaBloqueio,
  };
}
