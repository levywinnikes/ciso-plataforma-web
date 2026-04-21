"use client";

import { useMemo } from "react";

import { listNuclei, listReferrals } from "@/features/referrals/service";

import type { FinanceiroPageModel, NucleusRevenueRow } from "./schema";

export function useFinanceiroPageModel(): FinanceiroPageModel {
  const referrals = listReferrals();
  const nuclei = listNuclei();

  const totalReceita = useMemo(
    () =>
      referrals.reduce((sum, referral) => {
        const nucleus = nuclei.find((item) => item.id === referral.nucleusId);
        return sum + (nucleus?.chargedPrice ?? 0);
      }, 0),
    [nuclei, referrals],
  );

  const encaminhadosCount = useMemo(
    () => referrals.filter((item) => item.status === "Encaminhado").length,
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

  const revenueRows = useMemo<NucleusRevenueRow[]>(
    () =>
      nuclei.map((nucleus) => {
        const count = referrals.filter(
          (item) => item.nucleusId === nucleus.id,
        ).length;

        return {
          nucleus,
          count,
          revenue: count * nucleus.chargedPrice,
        };
      }),
    [nuclei, referrals],
  );

  return {
    referrals,
    nuclei,
    totalReceita,
    encaminhadosCount,
    agendadosCount,
    atendidosCount,
    revenueRows,
  };
}
