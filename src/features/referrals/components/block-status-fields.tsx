"use client";

import { useTranslations } from "next-intl";
import type {
  FieldError,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

import { Field } from "@/components/forms/field";
import { Select, Textarea } from "@/components/ui";
import { BLOCK_JUSTIFICATION_MAX_LENGTH } from "@/features/referrals/block-status";
import { useFormError } from "@/i18n/use-form-error";

type BlockStatusFormValues = {
  status: string;
  justificativaBloqueio?: string;
};

interface BlockStatusFieldsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  statusError?: FieldError;
  justificationError?: FieldError;
  /** When true, include Agendado/Atendido (admin edit). */
  allowOperationalStatuses?: boolean;
}

export function BlockStatusFields({
  register,
  watch,
  statusError,
  justificationError,
  allowOperationalStatuses = false,
}: BlockStatusFieldsProps) {
  const t = useTranslations("newReferral");
  const tError = useFormError();
  const status = watch("status") as BlockStatusFormValues["status"];

  return (
    <div className="space-y-4">
      <Field label={t("status")} error={tError(statusError?.message)}>
        <Select {...register("status")}>
          <option value="Encaminhado">{t("statusEncaminhado")}</option>
          <option value="Bloqueado">{t("statusBloqueado")}</option>
          {allowOperationalStatuses ? (
            <>
              <option value="Agendado">{t("statusAgendado")}</option>
              <option value="Atendido">{t("statusAtendido")}</option>
            </>
          ) : null}
        </Select>
      </Field>

      {status === "Bloqueado" ? (
        <Field
          label={t("blockJustification")}
          required
          error={tError(justificationError?.message)}
          hint={t("blockJustificationHint")}
        >
          <Textarea
            {...register("justificativaBloqueio")}
            maxLength={BLOCK_JUSTIFICATION_MAX_LENGTH}
            placeholder={t("blockJustificationPlaceholder")}
            rows={3}
          />
        </Field>
      ) : null}
    </div>
  );
}
