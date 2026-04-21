"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { CARE_NUCLEI } from "@/features/referrals/data";
import type { CareNucleus, NucleusService } from "@/features/referrals/types";

import type {
  AdminPageModel,
  NucleusFormData,
  ServiceFormData,
} from "./schema";
import { nucleusSchema, serviceSchema } from "./schema";

const INITIAL_SERVICES: NucleusService[] = Array.from(
  new Map(
    CARE_NUCLEI.flatMap((nucleus) => nucleus.services).map((service) => [
      service.id,
      service,
    ]),
  ).values(),
);

export function useAdminPageModel(): AdminPageModel {
  const [nuclei, setNuclei] = useState<CareNucleus[]>(CARE_NUCLEI);
  const [services, setServices] = useState<NucleusService[]>(INITIAL_SERVICES);
  const [isNucleusModalOpen, setIsNucleusModalOpen] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", price: undefined },
  });

  const nucleusForm = useForm<NucleusFormData>({
    resolver: zodResolver(nucleusSchema),
    defaultValues: { name: "", description: "", price: undefined },
  });

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [selectedServiceIds, services],
  );

  const selectedServicesFullPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.basePrice, 0),
    [selectedServices],
  );

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((item) => item !== serviceId)
        : [...current, serviceId],
    );
  };

  const handleCreateService = (data: ServiceFormData) => {
    const nextService: NucleusService = {
      id: `svc-${Date.now()}`,
      name: data.name,
      basePrice: data.price,
    };

    setServices((current) => [...current, nextService]);
    serviceForm.reset();
  };

  const handleCreateNucleus = (data: NucleusFormData) => {
    if (selectedServices.length === 0) return;

    const nextNucleus: CareNucleus = {
      id: `nucleus-${Date.now()}`,
      name: data.name,
      description: data.description,
      chargedPrice: data.price,
      services: selectedServices,
    };

    setNuclei((current) => [nextNucleus, ...current]);
    nucleusForm.reset();
    setSelectedServiceIds([]);
    setIsNucleusModalOpen(false);
  };

  return {
    nuclei,
    services,
    isNucleusModalOpen,
    selectedServices,
    selectedServicesFullPrice,
    selectedServiceIds,
    serviceForm,
    nucleusForm,
    setIsNucleusModalOpen,
    toggleService,
    onCreateService: serviceForm.handleSubmit(handleCreateService),
    onCreateNucleus: nucleusForm.handleSubmit(handleCreateNucleus),
  };
}
