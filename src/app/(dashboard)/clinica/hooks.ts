"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { Referral } from "@/features/referrals/types";

import type { ClinicaPageModel, ScheduleFormData } from "./schema";
import { scheduleSchema } from "./schema";

export function useClinicaPageModel(): ClinicaPageModel {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const scheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { doctor: "", scheduleDate: "" },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadReferrals() {
      const response = await fetch("/api/referrals", { cache: "no-store" });
      const data = (await response.json()) as Referral[];

      if (isMounted) {
        setReferrals(data);
      }
    }

    void loadReferrals();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingReferralsCount = useMemo(
    () =>
      referrals.filter((referral) => referral.status === "Encaminhado").length,
    [referrals],
  );

  const agendadosCount = useMemo(
    () => referrals.filter((item) => item.status === "Agendado").length,
    [referrals],
  );

  const atendidosCount = useMemo(
    () => referrals.filter((item) => item.status === "Atendido").length,
    [referrals],
  );

  const handleOpenTriage = (referral: Referral) => {
    setSelectedReferral(referral);
    scheduleForm.reset({
      doctor: referral.doctor ?? "",
      scheduleDate: referral.appointmentDate
        ? referral.appointmentDate.slice(0, 16)
        : "",
    });
  };

  const handleSaveSchedule = async (data: ScheduleFormData) => {
    if (!selectedReferral) return;

    const response = await fetch(
      `/api/referrals/${selectedReferral.id}/schedule`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: data.doctor,
          appointmentDate: data.scheduleDate,
        }),
      },
    );

    if (response.ok) {
      setReferrals((current) =>
        current.map((item) =>
          item.id === selectedReferral.id
            ? {
                ...item,
                doctor: data.doctor,
                appointmentDate: data.scheduleDate,
                status: "Agendado",
              }
            : item,
        ),
      );
    }

    setSelectedReferral(null);
  };

  return {
    selectedReferral,
    referrals,
    pendingReferralsCount,
    agendadosCount,
    atendidosCount,
    scheduleForm,
    setSelectedReferral,
    handleOpenTriage,
    onSaveSchedule: scheduleForm.handleSubmit(handleSaveSchedule),
  };
}
