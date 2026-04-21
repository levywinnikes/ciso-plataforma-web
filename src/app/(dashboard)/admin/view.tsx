import { useTranslations } from "next-intl";

import { Button, CardSection, Input, Modal, PageHeader } from "@/components/ui";
import { NucleusCard } from "@/features/referrals/components/nucleus-card";
import { PriceSummary } from "@/features/referrals/components/price-summary";
import { formatCurrency } from "@/features/referrals/utils";

import type { AdminPageModel } from "./schema";

interface AdminPageViewProps {
  model: AdminPageModel;
}

export function AdminPageView({ model }: AdminPageViewProps) {
  const t = useTranslations("admin");
  const common = useTranslations("common");

  const { register: registerService, formState: serviceState } =
    model.serviceForm;
  const {
    register: registerNucleus,
    formState: nucleusState,
    watch,
  } = model.nucleusForm;

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
          <NucleusCard key={nucleus.id} nucleus={nucleus} />
        ))}
      </div>

      <CardSection title={t("serviceCatalog")}>
        <form onSubmit={model.onCreateService} className="space-y-2">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Input
                placeholder={t("serviceNamePlaceholder")}
                {...registerService("name")}
              />
              {serviceState.errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {serviceState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="number"
                step="0.01"
                placeholder={t("servicePricePlaceholder")}
                {...registerService("price", { valueAsNumber: true })}
              />
              {serviceState.errors.price && (
                <p className="mt-1 text-xs text-red-500">
                  {serviceState.errors.price.message}
                </p>
              )}
            </div>
            <Button type="submit">{t("addService")}</Button>
          </div>
        </form>
      </CardSection>

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
                {nucleusState.errors.name.message}
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
                {nucleusState.errors.description.message}
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
                {nucleusState.errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              {t("includedServices")}
            </p>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded border border-gray-200 p-2">
              {model.services.map((service) => (
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
    </div>
  );
}
