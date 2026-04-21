"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  listReferrals,
  updateReferralSchedule,
} from "@/features/referrals/service";
import type { Referral } from "@/features/referrals/types";

import type { ClinicaPageModel, ScheduleFormData } from "./schema";
import { scheduleSchema } from "./schema";

export function useClinicaPageModel(): ClinicaPageModel {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );

  const scheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { doctor: "", scheduleDate: "" },
  });

  const referrals = listReferrals();
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

  const handleSaveSchedule = (data: ScheduleFormData) => {
    if (!selectedReferral) return;

    updateReferralSchedule({
      referralId: selectedReferral.id,
      doctor: data.doctor,
      appointmentDate: data.scheduleDate,
    });

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
