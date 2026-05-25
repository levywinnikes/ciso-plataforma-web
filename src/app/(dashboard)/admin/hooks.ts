"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { CareNucleus, NucleusService } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import type { AdminPageModel, NucleusFormData } from "./schema";
import { nucleusSchema } from "./schema";

export function useAdminPageModel(): AdminPageModel {
  const [nuclei, setNuclei] = useState<CareNucleus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<NucleusService[]>([]);

  const [isNucleusModalOpen, setIsNucleusModalOpen] = useState(false);
  const [isEditNucleusModalOpen, setIsEditNucleusModalOpen] = useState(false);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [editingNucleusId, setEditingNucleusId] = useState<string | null>(null);

  const toast = useAppToast();
  const tError = useFormError();

  async function loadData() {
    setIsLoading(true);
    try {
      const [nucleiRes, servicesRes] = await Promise.all([
        fetch("/api/nuclei", { cache: "no-store" }),
        fetch("/api/services", { cache: "no-store" }),
      ]);
      if (nucleiRes.ok) {
        setNuclei(await nucleiRes.json());
      }
      if (servicesRes.ok) {
        setServices(await servicesRes.json());
      }
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

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
    () =>
      selectedServices.reduce(
        (sum, service) => sum + Number(service.basePrice),
        0,
      ),
    [selectedServices],
  );

  const filteredServices = useMemo(() => {
    const term = serviceSearchTerm.trim().toLowerCase();
    if (!term) return services;
    return services.filter((service) =>
      service.name.toLowerCase().includes(term),
    );
  }, [serviceSearchTerm, services]);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((item) => item !== serviceId)
        : [...current, serviceId],
    );
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
    const catalogIds = target.services.map((s) => s.id);

    setSelectedServiceIds(catalogIds);
    setIsEditNucleusModalOpen(true);
  };

  const handleUpdateNucleus = async (data: NucleusFormData) => {
    if (!editingNucleusId) return;

    if (selectedServiceIds.length === 0) {
      toast.error(tError("errors.atLeastOneService") ?? "");
      return;
    }

    const response = await fetch(`/api/nuclei/${editingNucleusId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        chargedPrice: data.price,
        serviceIds: selectedServiceIds,
      }),
    });

    if (!response.ok) {
      toast.error(tError("errors.genericRequestFailed") ?? "");
      return;
    }

    toast.success("Núcleo atualizado com sucesso!");
    setIsEditNucleusModalOpen(false);
    setEditingNucleusId(null);
    setSelectedServiceIds([]);
    await loadData();
  };

  const deleteNucleus = async (nucleusId: string) => {
    const response = await fetch(`/api/nuclei/${nucleusId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error(tError("errors.genericRequestFailed") ?? "");
      return;
    }

    toast.success("Núcleo excluído com sucesso!");
    await loadData();
  };

  const handleCreateNucleus = async (data: NucleusFormData) => {
    if (selectedServiceIds.length === 0) {
      toast.error(tError("errors.atLeastOneService") ?? "");
      return;
    }

    const response = await fetch("/api/nuclei", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        chargedPrice: data.price,
        serviceIds: selectedServiceIds,
      }),
    });

    if (!response.ok) {
      toast.error(tError("errors.genericRequestFailed") ?? "");
      return;
    }

    toast.success("Núcleo criado com sucesso!");
    nucleusForm.reset();
    setSelectedServiceIds([]);
    setIsNucleusModalOpen(false);
    await loadData();
  };

  return {
    nuclei,
    isLoading,
    services,
    filteredServices,
    isNucleusModalOpen,
    isEditNucleusModalOpen,
    selectedServices,
    selectedServicesFullPrice,
    selectedServiceIds,
    serviceSearchTerm,
    nucleusForm,
    nucleusEditForm,
    setIsNucleusModalOpen,
    setIsEditNucleusModalOpen,
    setServiceSearchTerm,
    toggleService,
    openEditNucleusModal,
    deleteNucleus,
    onUpdateNucleus: nucleusEditForm.handleSubmit(handleUpdateNucleus),
    onCreateNucleus: nucleusForm.handleSubmit(handleCreateNucleus),
  };
}
