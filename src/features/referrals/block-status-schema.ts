import { z } from "zod";

import { BLOCK_JUSTIFICATION_MAX_LENGTH } from "@/features/referrals/block-status";

export const createStatusField = z.enum(["Encaminhado", "Bloqueado"]);

export function withBlockJustification<T extends z.ZodRawShape>(
  shape: T,
  statusField: "status" = "status",
) {
  return z.object(shape).superRefine((data, ctx) => {
    const status = (data as Record<string, unknown>)[statusField];
    if (status !== "Bloqueado") return;

    const raw = (data as Record<string, unknown>).justificativaBloqueio;
    const value = typeof raw === "string" ? raw.trim() : "";

    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.blockJustificationRequired",
        path: ["justificativaBloqueio"],
      });
      return;
    }

    if (value.length > BLOCK_JUSTIFICATION_MAX_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.blockJustificationMaxLength",
        path: ["justificativaBloqueio"],
      });
    }
  });
}
