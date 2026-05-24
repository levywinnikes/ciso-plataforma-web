import { useTranslations } from "next-intl";
import { useState } from "react";

import { Field } from "@/components/forms/field";
import {
  Button,
  ConfirmDialog,
  FloatingInput,
  Input,
  Modal,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import { NucleusCard } from "@/features/referrals/components/nucleus-card";
import { PriceSummary } from "@/features/referrals/components/price-summary";
import { formatCurrency } from "@/features/referrals/utils";
import { useFormError } from "@/i18n/use-form-error";

import type { AdminPageModel } from "./schema";

interface AdminPageViewProps {
  model: AdminPageModel;
}

export function AdminPageView({ model }: AdminPageViewProps) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const tError = useFormError();
  const [pendingDeleteNucleusId, setPendingDeleteNucleusId] = useState<
    string | null
  >(null);

  const {
    register: registerNucleus,
    formState: nucleusState,
    watch,
  } = model.nucleusForm;
  const { register: registerNucleusEdit, formState: nucleusEditState } =
    model.nucleusEditForm;

  const watchedPrice = watch("price");
  const nucleusPrice =
    watchedPrice && !isNaN(Number(watchedPrice)) ? Number(watchedPrice) : 0;

  const watchedPriceEdit = model.nucleusEditForm.watch("price");
  const nucleusEditPrice =
    watchedPriceEdit && !isNaN(Number(watchedPriceEdit))
      ? Number(watchedPriceEdit)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button onClick={() => model.setIsNucleusModalOpen(true)}>
            {t("newNucleus")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {model.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))
        ) : model.nuclei.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-sm text-gray-500">
            Nenhum registro encontrado
          </div>
        ) : (
          model.nuclei.map((nucleus) => (
            <NucleusCard
              key={nucleus.id}
              nucleus={nucleus}
              actions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => model.openEditNucleusModal(nucleus.id)}
                  >
                    {t("editNucleusAction")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => setPendingDeleteNucleusId(nucleus.id)}
                  >
                    {t("deleteNucleusAction")}
                  </Button>
                </>
              }
            />
          ))
        )}
      </div>

      <Modal
        isOpen={model.isNucleusModalOpen}
        onClose={() => model.setIsNucleusModalOpen(false)}
        title={t("newNucleusModalTitle")}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={model.onCreateNucleus} className="space-y-4 pt-4">
          <Field label={""} error={tError(nucleusState.errors.name?.message)}>
            <FloatingInput
              required
              label={t("nucleusNamePlaceholder")}
              {...registerNucleus("name")}
            />
          </Field>
          <Field
            label={""}
            error={tError(nucleusState.errors.description?.message)}
          >
            <FloatingInput
              required
              label={t("nucleusDescriptionPlaceholder")}
              {...registerNucleus("description")}
            />
          </Field>
          <Field label={""} error={tError(nucleusState.errors.price?.message)}>
            <FloatingInput
              required
              type="number"
              step="0.01"
              label={t("nucleusPricePlaceholder")}
              {...registerNucleus("price", { valueAsNumber: true })}
            />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center">
              <p className="text-sm font-semibold text-gray-700">
                {t("includedServices")}
              </p>
            </div>

            <Input
              placeholder={t("serviceSearchPlaceholder")}
              value={model.serviceSearchTerm}
              onChange={(event) =>
                model.setServiceSearchTerm(event.target.value)
              }
            />

            <div className="max-h-44 space-y-2 overflow-y-auto rounded border border-gray-200 p-2">
              {model.filteredServices.length === 0 ? (
                <p className="px-2 py-3 text-sm text-gray-500">
                  {t("serviceSearchEmpty")}
                </p>
              ) : null}

              {model.filteredServices.map((service) => (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center justify-between rounded border border-gray-100 p-2 text-sm"
                >
                  <span>{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {formatCurrency(service.basePrice)}
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={model.selectedServiceIds.includes(service.id)}
                      onChange={() => model.toggleService(service.id)}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="mb-3 flex items-center justify-between">
              <span>{t("servicesSum")}</span>
              <span>{formatCurrency(model.selectedServicesFullPrice)}</span>
            </p>
            <PriceSummary
              fullPrice={model.selectedServicesFullPrice}
              chargedPrice={
                nucleusPrice > 0
                  ? nucleusPrice
                  : model.selectedServicesFullPrice
              }
              discount={
                nucleusPrice > 0 &&
                model.selectedServicesFullPrice > nucleusPrice
                  ? model.selectedServicesFullPrice - nucleusPrice
                  : 0
              }
              variant="inline"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => model.setIsNucleusModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button type="submit">{t("saveNucleus")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={model.isEditNucleusModalOpen}
        onClose={() => model.setIsEditNucleusModalOpen(false)}
        title={t("editNucleusModalTitle")}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={model.onUpdateNucleus} className="space-y-4 pt-4">
          <Field
            label={""}
            error={tError(nucleusEditState.errors.name?.message)}
          >
            <FloatingInput
              required
              label={t("nucleusNamePlaceholder")}
              {...registerNucleusEdit("name")}
            />
          </Field>
          <Field
            label={""}
            error={tError(nucleusEditState.errors.description?.message)}
          >
            <FloatingInput
              required
              label={t("nucleusDescriptionPlaceholder")}
              {...registerNucleusEdit("description")}
            />
          </Field>
          <Field
            label={""}
            error={tError(nucleusEditState.errors.price?.message)}
          >
            <FloatingInput
              required
              type="number"
              step="0.01"
              label={t("nucleusPricePlaceholder")}
              {...registerNucleusEdit("price", { valueAsNumber: true })}
            />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center">
              <p className="text-sm font-semibold text-gray-700">
                {t("includedServices")}
              </p>
            </div>

            <Input
              placeholder={t("serviceSearchPlaceholder")}
              value={model.serviceSearchTerm}
              onChange={(event) =>
                model.setServiceSearchTerm(event.target.value)
              }
            />

            <div className="max-h-44 space-y-2 overflow-y-auto rounded border border-gray-200 p-2">
              {model.filteredServices.length === 0 ? (
                <p className="px-2 py-3 text-sm text-gray-500">
                  {t("serviceSearchEmpty")}
                </p>
              ) : null}

              {model.filteredServices.map((service) => (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center justify-between rounded border border-gray-100 p-2 text-sm"
                >
                  <span>{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {formatCurrency(service.basePrice)}
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={model.selectedServiceIds.includes(service.id)}
                      onChange={() => model.toggleService(service.id)}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="mb-3 flex items-center justify-between">
              <span>{t("servicesSum")}</span>
              <span>{formatCurrency(model.selectedServicesFullPrice)}</span>
            </p>
            <PriceSummary
              fullPrice={model.selectedServicesFullPrice}
              chargedPrice={
                nucleusEditPrice > 0
                  ? nucleusEditPrice
                  : model.selectedServicesFullPrice
              }
              discount={
                nucleusEditPrice > 0 &&
                model.selectedServicesFullPrice > nucleusEditPrice
                  ? model.selectedServicesFullPrice - nucleusEditPrice
                  : 0
              }
              variant="inline"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => model.setIsEditNucleusModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button type="submit">{common("save")}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={model.isServiceModalOpen}
        onClose={() => model.setIsServiceModalOpen(false)}
        title={t("newServiceModalTitle")}
        maxWidth="max-w-md"
      >
        <form onSubmit={model.onCreateService} className="space-y-4 pt-4">
          <Field
            label={""}
            error={tError(model.serviceForm.formState.errors.name?.message)}
          >
            <FloatingInput
              required
              label={t("serviceNamePlaceholder")}
              {...model.serviceForm.register("name")}
            />
          </Field>
          <Field
            label={""}
            error={tError(model.serviceForm.formState.errors.price?.message)}
          >
            <FloatingInput
              required
              type="number"
              step="0.01"
              label={t("servicePricePlaceholder")}
              {...model.serviceForm.register("price", { valueAsNumber: true })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => model.setIsServiceModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button type="submit">{t("addService")}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDeleteNucleusId !== null}
        onClose={() => setPendingDeleteNucleusId(null)}
        onConfirm={async () => {
          if (!pendingDeleteNucleusId) return;
          await model.deleteNucleus(pendingDeleteNucleusId);
          setPendingDeleteNucleusId(null);
        }}
        title={common("confirmDeleteTitle")}
        message={t("confirmDeleteNucleus")}
        hint={common("irreversibleAction")}
        cancelLabel={common("cancel")}
        confirmLabel={common("confirm")}
      />
    </div>
  );
}
