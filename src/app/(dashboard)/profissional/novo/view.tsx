import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  FileUploadArea,
  FloatingInput,
  Select,
  Textarea,
} from "@/components/ui";
import { PriceSummary } from "@/features/referrals/components/price-summary";
import { CARE_NUCLEI, CLINICAL_SUSPECTS } from "@/features/referrals/data";
import {
  formatCurrency,
  getNucleusPriceSummary,
} from "@/features/referrals/utils";
import { useFormError } from "@/i18n/use-form-error";

import type { NovoEncaminhamentoPageModel } from "./schema";

interface NovoEncaminhamentoPageViewProps {
  model: NovoEncaminhamentoPageModel;
}

export function NovoEncaminhamentoPageView({
  model,
}: NovoEncaminhamentoPageViewProps) {
  const t = useTranslations("newReferral");
  const common = useTranslations("common");
  const tError = useFormError();

  const { register, formState } = model.form;
  const errors = formState.errors;

  const priceSummary = model.selectedNucleus
    ? getNucleusPriceSummary(model.selectedNucleus)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profissional">
          <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>
      </div>

      <form onSubmit={model.onSubmit} className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <CardSection title={t("patientData")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label={""} error={tError(errors.patientName?.message)}>
                  <FloatingInput
                    required
                    label={t("patientName")}
                    {...register("patientName")}
                  />
                </Field>
              </div>
              <Field
                label={""}
                error={tError(errors.patientBirthDate?.message)}
              >
                <FloatingInput
                  type="date"
                  required
                  label={t("birthDate")}
                  {...register("patientBirthDate")}
                />
              </Field>
              <Field label={""} error={tError(errors.patientPhone?.message)}>
                <FloatingInput
                  mask="phone"
                  required
                  label={t("phone")}
                  {...register("patientPhone")}
                />
              </Field>
              <div className="md:col-span-2">
                <Field
                  label={""}
                  hint={t("optional")}
                  error={tError(errors.patientDocument?.message)}
                >
                  <FloatingInput
                    label={t("document")}
                    {...register("patientDocument")}
                  />
                </Field>
              </div>
            </div>
          </CardSection>

          <CardSection title={t("clinicalInfo")}>
            <div className="grid gap-4">
              <Field label={t("systemicDiseases")} hint={t("optionalFreeText")}>
                <Textarea {...register("systemicDiseases")} />
              </Field>
              <Field
                label={t("clinicalSuspect")}
                error={tError(errors.clinicalSuspect?.message)}
              >
                <Select {...register("clinicalSuspect")}>
                  <option value="">{t("selectClinicalSuspect")}</option>
                  {CLINICAL_SUSPECTS.map((suspect) => (
                    <option key={suspect} value={suspect}>
                      {suspect}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("clinicalNotes")}>
                <Textarea
                  {...register("clinicalNotes")}
                  placeholder={t("clinicalNotesPlaceholder")}
                />
              </Field>
            </div>
          </CardSection>

          <CardSection title={t("documents")}>
            <FileUploadArea
              files={model.documents.map((file) => file.name)}
              onAddFile={model.handleFakeUpload}
              label={t("includeDocuments")}
            />
          </CardSection>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <CardSection
            title={t("careNuclei")}
            titleClassName="mb-4 text-lg font-bold text-primary"
          >
            <div className="mb-4 border-b pb-4">
              <Field
                label={t("selectClinic")}
                required
                error={tError(errors.clinicId?.message)}
              >
                <Select {...register("clinicId")}>
                  <option value="">{common("select")}</option>
                  {model.clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label={t("selectNucleus")}
              required
              error={tError(errors.nucleusId?.message)}
            >
              <Select {...register("nucleusId")}>
                <option value="">{common("select")}</option>
                {CARE_NUCLEI.map((nucleus) => (
                  <option key={nucleus.id} value={nucleus.id}>
                    {nucleus.name}
                  </option>
                ))}
              </Select>
            </Field>

            {model.selectedNucleus && priceSummary && (
              <div className="mt-4 space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="font-semibold text-primary">
                  {model.selectedNucleus.description}
                </p>
                <ul className="space-y-2 text-gray-700">
                  {model.selectedNucleus.services.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <span>{service.name}</span>
                      <span>{formatCurrency(service.basePrice)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-primary/20 pt-3">
                  <PriceSummary {...priceSummary} variant="inline" />
                </div>
              </div>
            )}

            <Button type="submit" className="mt-6 w-full">
              {t("saveReferral")}
            </Button>
          </CardSection>
        </div>
      </form>
    </div>
  );
}
