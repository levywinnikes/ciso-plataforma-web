import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Button,
  ConfirmDialog,
  Input,
  Modal,
  PageHeader,
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
        {model.nuclei.map((nucleus) => (
          <div key={nucleus.id} className="space-y-2">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => model.openEditNucleusModal(nucleus.id)}
              >
                {t("editNucleusAction")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setPendingDeleteNucleusId(nucleus.id)}
              >
                {t("deleteNucleusAction")}
              </Button>
            </div>
            <NucleusCard nucleus={nucleus} />
          </div>
        ))}
      </div>

      <Modal
        isOpen={model.isNucleusModalOpen}
        onClose={() => model.setIsNucleusModalOpen(false)}
        title={t("newNucleusModalTitle")}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={model.onCreateNucleus} className="space-y-4">
          <div>
            <Input
              placeholder={t("nucleusNamePlaceholder")}
              {...registerNucleus("name")}
            />
            {nucleusState.errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {tError(nucleusState.errors.name.message)}
              </p>
            )}
          </div>
          <div>
            <Input
              placeholder={t("nucleusDescriptionPlaceholder")}
              {...registerNucleus("description")}
            />
            {nucleusState.errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {tError(nucleusState.errors.description.message)}
              </p>
            )}
          </div>
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder={t("nucleusPricePlaceholder")}
              {...registerNucleus("price", { valueAsNumber: true })}
            />
            {nucleusState.errors.price && (
              <p className="mt-1 text-xs text-red-500">
                {tError(nucleusState.errors.price.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {t("includedServices")}
              </p>
              <span className="text-xs text-gray-500">
                {t("servicesManagedElsewhere")}
              </span>
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
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <Input
              placeholder={t("nucleusNamePlaceholder")}
              {...registerNucleusEdit("name")}
            />
            {nucleusEditState.errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {tError(nucleusEditState.errors.name.message)}
              </p>
            )}
          </div>
          <div>
            <Input
              placeholder={t("nucleusDescriptionPlaceholder")}
              {...registerNucleusEdit("description")}
            />
            {nucleusEditState.errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {tError(nucleusEditState.errors.description.message)}
              </p>
            )}
          </div>
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder={t("nucleusPricePlaceholder")}
              {...registerNucleusEdit("price", { valueAsNumber: true })}
            />
            {nucleusEditState.errors.price && (
              <p className="mt-1 text-xs text-red-500">
                {tError(nucleusEditState.errors.price.message)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => model.setIsEditNucleusModalOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button type="button" onClick={model.onUpdateNucleus}>
              {common("save")}
            </Button>
          </div>
        </div>
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
