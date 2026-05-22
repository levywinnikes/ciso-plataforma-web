"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { CARE_NUCLEI } from "@/features/referrals/data";
import type { CareNucleus, NucleusService } from "@/features/referrals/types";

import type {
  AdminPageModel,
  ManagedServiceRow,
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

function buildServiceCatalog(nucleiList: CareNucleus[]): NucleusService[] {
  const servicesMap = new Map<string, NucleusService>();

  nucleiList
    .flatMap((nucleus) => nucleus.services)
    .forEach((service) => {
      if (!servicesMap.has(service.name)) {
        servicesMap.set(service.name, {
          id: service.id,
          name: service.name,
          basePrice: service.basePrice,
        });
      }
    });

  return Array.from(servicesMap.values());
}

export function useAdminPageModel(): AdminPageModel {
  const [nuclei, setNuclei] = useState<CareNucleus[]>(CARE_NUCLEI);
  const [services, setServices] = useState<NucleusService[]>(INITIAL_SERVICES);
  const [isNucleusModalOpen, setIsNucleusModalOpen] = useState(false);
  const [isEditNucleusModalOpen, setIsEditNucleusModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceManagerSearchTerm, setServiceManagerSearchTerm] = useState("");
  const [editingNucleusId, setEditingNucleusId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNuclei() {
      try {
        const response = await fetch("/api/nuclei", { cache: "no-store" });
        if (!response.ok) return;

        const nucleiData = (await response.json()) as CareNucleus[];
        if (!isMounted) return;

        setNuclei(nucleiData);
        setServices(buildServiceCatalog(nucleiData));
      } catch {
        // Keep local fallback when API is unavailable.
      }
    }

    void loadNuclei();

    return () => {
      isMounted = false;
    };
  }, []);

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", price: undefined },
  });

  const serviceEditForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", price: undefined },
  });

  const nucleusForm = useForm<NucleusFormData>({
    resolver: zodResolver(nucleusSchema),
    defaultValues: { name: "", description: "", price: undefined },
  });

  const nucleusEditForm = useForm<NucleusFormData>({
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

  const filteredServices = useMemo(() => {
    const term = serviceSearchTerm.trim().toLowerCase();
    if (!term) return services;

    return services.filter((service) =>
      service.name.toLowerCase().includes(term),
    );
  }, [serviceSearchTerm, services]);

  const managedServiceRows = useMemo<ManagedServiceRow[]>(() => {
    const rows = nuclei.flatMap((nucleus) =>
      nucleus.services.map((service) => ({
        id: service.id,
        name: service.name,
        basePrice: service.basePrice,
        nucleusId: nucleus.id,
        nucleusName: nucleus.name,
      })),
    );

    const term = serviceManagerSearchTerm.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.nucleusName.toLowerCase().includes(term),
    );
  }, [nuclei, serviceManagerSearchTerm]);

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
    setSelectedServiceIds((current) => [...current, nextService.id]);
    serviceForm.reset();
    setIsServiceModalOpen(false);
  };

  const openEditNucleusModal = (nucleusId: string) => {
    const target = nuclei.find((item) => item.id === nucleusId);
    if (!target) return;

    setEditingNucleusId(nucleusId);
    nucleusEditForm.reset({
      name: target.name,
      description: target.description,
      price: target.chargedPrice,
    });
    setIsEditNucleusModalOpen(true);
  };

  const handleUpdateNucleus = async (data: NucleusFormData) => {
    if (!editingNucleusId) return;

    const response = await fetch(`/api/nuclei/${editingNucleusId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        chargedPrice: data.price,
      }),
    });

    if (!response.ok) return;

    const updated = (await response.json()) as CareNucleus;

    setNuclei((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );

    setIsEditNucleusModalOpen(false);
    setEditingNucleusId(null);
  };

  const deleteNucleus = async (nucleusId: string) => {
    const response = await fetch(`/api/nuclei/${nucleusId}`, {
      method: "DELETE",
    });

    if (!response.ok) return;

    setNuclei((current) => {
      const nextNuclei = current.filter((item) => item.id !== nucleusId);
      setServices(buildServiceCatalog(nextNuclei));
      return nextNuclei;
    });
  };

  const openEditServiceModal = (serviceId: string) => {
    const target = managedServiceRows.find((row) => row.id === serviceId);
    if (!target) return;

    setEditingServiceId(serviceId);
    serviceEditForm.reset({
      name: target.name,
      price: target.basePrice,
    });
    setIsEditServiceModalOpen(true);
  };

  const handleUpdateService = async (data: ServiceFormData) => {
    if (!editingServiceId) return;

    const response = await fetch(`/api/nuclei/services/${editingServiceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        basePrice: data.price,
      }),
    });

    if (!response.ok) return;

    const updated = (await response.json()) as {
      id: string;
      name: string;
      basePrice: number;
      nucleusId: string;
    };

    setNuclei((current) =>
      current.map((nucleus) => {
        if (nucleus.id !== updated.nucleusId) return nucleus;

        return {
          ...nucleus,
          services: nucleus.services.map((service) =>
            service.id === updated.id
              ? {
                  ...service,
                  name: updated.name,
                  basePrice: updated.basePrice,
                }
              : service,
          ),
        };
      }),
    );

    setServices((current) =>
      current.map((service) =>
        service.id === updated.id
          ? {
              ...service,
              name: updated.name,
              basePrice: updated.basePrice,
            }
          : service,
      ),
    );

    setIsEditServiceModalOpen(false);
    setEditingServiceId(null);
  };

  const deleteService = async (serviceId: string) => {
    const response = await fetch(`/api/nuclei/services/${serviceId}`, {
      method: "DELETE",
    });

    if (!response.ok) return;

    setNuclei((current) =>
      current.map((nucleus) => ({
        ...nucleus,
        services: nucleus.services.filter(
          (service) => service.id !== serviceId,
        ),
      })),
    );
    setServices((current) =>
      current.filter((service) => service.id !== serviceId),
    );
    setSelectedServiceIds((current) =>
      current.filter((selectedId) => selectedId !== serviceId),
    );
  };

  const handleCreateNucleus = async (data: NucleusFormData) => {
    if (selectedServices.length === 0) return;

    const response = await fetch("/api/nuclei", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        chargedPrice: data.price,
        services: selectedServices.map((service) => ({
          name: service.name,
          basePrice: service.basePrice,
        })),
      }),
    });

    if (!response.ok) return;

    const createdNucleus = (await response.json()) as CareNucleus;
    setNuclei((current) => {
      const nextNuclei = [createdNucleus, ...current];
      setServices(buildServiceCatalog(nextNuclei));
      return nextNuclei;
    });

    nucleusForm.reset();
    setSelectedServiceIds([]);
    setIsNucleusModalOpen(false);
  };

  return {
    nuclei,
    services,
    isNucleusModalOpen,
    isEditNucleusModalOpen,
    isServiceModalOpen,
    isEditServiceModalOpen,
    selectedServices,
    selectedServicesFullPrice,
    selectedServiceIds,
    filteredServices,
    serviceSearchTerm,
    managedServiceRows,
    serviceManagerSearchTerm,
    serviceForm,
    serviceEditForm,
    nucleusForm,
    nucleusEditForm,
    setIsNucleusModalOpen,
    setIsEditNucleusModalOpen,
    setIsServiceModalOpen,
    setIsEditServiceModalOpen,
    setServiceSearchTerm,
    setServiceManagerSearchTerm,
    toggleService,
    openEditNucleusModal,
    deleteNucleus,
    openEditServiceModal,
    deleteService,
    onCreateService: serviceForm.handleSubmit(handleCreateService),
    onUpdateNucleus: nucleusEditForm.handleSubmit(handleUpdateNucleus),
    onUpdateService: serviceEditForm.handleSubmit(handleUpdateService),
    onCreateNucleus: nucleusForm.handleSubmit(handleCreateNucleus),
  };
}
