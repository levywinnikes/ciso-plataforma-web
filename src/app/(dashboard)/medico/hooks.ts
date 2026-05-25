"use client";

import { useEffect, useMemo, useState } from "react";

import type { Referral } from "@/features/referrals/types";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

import type { MedicoPageModel } from "./schema";

export function useMedicoPageModel(): MedicoPageModel {
  const toast = useAppToast();
  const tError = useFormError();

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notes, setNotes] = useState("");
  const [conduct, setConduct] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Appointment states
  const [appointmentDoctor, setAppointmentDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [availableDoctors, setAvailableDoctors] = useState<
    { id: string; name: string }[]
  >([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [refResponse, docsResponse] = await Promise.all([
          fetch("/api/referrals", { cache: "no-store" }),
          fetch("/api/users/organization", { cache: "no-store" }),
        ]);

        const refData = (await refResponse.json()) as Referral[];
        const docsData = await docsResponse.json();

        if (isMounted) {
          setReferrals(refData);
          if (Array.isArray(docsData)) {
            setAvailableDoctors(
              docsData.filter(
                (d: any) => d.role === "MEDICO" || d.role === "ADMINISTRATIVO",
              ),
            );
          }
        }
      } catch (e) {
        console.error(e);
        toast.error(
          tError("errors.genericRequestFailed") ?? "Erro ao carregar dados.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(
    () =>
      referrals.filter(
        (referral) =>
          referral.status === "Agendado" ||
          referral.status === "Encaminhado" ||
          referral.status === "Atendido",
      ),
    [referrals],
  );

  const handleOpenAtendimento = (referral: Referral) => {
    setSelectedReferral(referral);
    setNotes(referral.specialistNotes ?? "");
    setConduct(referral.specialistConduct ?? "");
    setFiles((referral.specialistAttachments ?? []).map((item) => item.name));

    setAppointmentDoctor(referral.doctor ?? "");
    if (referral.appointmentDate) {
      // Input datetime-local expects YYYY-MM-DDThh:mm
      setAppointmentDate(
        new Date(referral.appointmentDate).toISOString().slice(0, 16),
      );
    } else {
      setAppointmentDate("");
    }
  };

  const handleAddFile = () => {
    setFiles((current) => [...current, `arquivo-${current.length + 1}.pdf`]);
  };

  const handleSave = async (complete: boolean = false) => {
    if (!selectedReferral) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/referrals/${selectedReferral.id}/specialist`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes,
            conduct,
            files: files.map((file, index) => ({
              id: `SPC-${index + 1}`,
              name: file,
              uploadedAt: new Date().toISOString(),
            })),
            complete,
          }),
        },
      );

      if (response.ok) {
        setReferrals((current) =>
          current.map((item) =>
            item.id === selectedReferral.id
              ? {
                  ...item,
                  specialistNotes: notes,
                  specialistConduct: conduct,
                  specialistAttachments: files.map((file, index) => ({
                    id: `SPC-${index + 1}`,
                    name: file,
                    uploadedAt: new Date().toISOString(),
                  })),
                  status: complete ? "Atendido" : item.status,
                }
              : item,
          ),
        );
        toast.success(
          complete
            ? "Atendimento concluído com sucesso!"
            : "Atendimento salvo com sucesso!",
        );
        setSelectedReferral(null);
      } else {
        toast.error(
          tError("errors.genericRequestFailed") ??
            "Erro ao salvar o atendimento.",
        );
      }
    } catch (e) {
      console.error(e);
      toast.error(
        tError("errors.genericRequestFailed") ??
          "Erro ao salvar o atendimento.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmComplete = async () => {
    setIsConfirmOpen(false);
    await handleSave(true);
  };

  const handleSchedule = async () => {
    if (!selectedReferral || !appointmentDoctor || !appointmentDate) {
      toast.error("Preencha o médico e a data/hora para agendar.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/referrals/${selectedReferral.id}/schedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor: appointmentDoctor,
            appointmentDate: new Date(appointmentDate).toISOString(),
          }),
        },
      );

      if (response.ok) {
        setReferrals((current) =>
          current.map((item) =>
            item.id === selectedReferral.id
              ? {
                  ...item,
                  doctor: appointmentDoctor,
                  appointmentDate: new Date(appointmentDate).toISOString(),
                  status: "Agendado",
                }
              : item,
          ),
        );
        toast.success("Agendamento realizado com sucesso!");
        setSelectedReferral(null);
      } else {
        const err = await response.json();
        toast.error(err.message || "Erro ao agendar.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao agendar.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    selectedReferral,
    notes,
    conduct,
    files,
    items,
    appointmentDoctor,
    appointmentDate,
    availableDoctors,
    isLoading,
    isSaving,
    setSelectedReferral,
    setNotes,
    setConduct,
    setAppointmentDoctor,
    setAppointmentDate,
    handleOpenAtendimento,
    handleAddFile,
    handleSave,
    handleSchedule,
    isConfirmOpen,
    setIsConfirmOpen,
    handleCompleteClick,
    handleConfirmComplete,
  };
}
