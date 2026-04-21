"use client";

import { useEffect, useMemo, useState } from "react";

import type { CareNucleus, Referral } from "@/features/referrals/types";

import type { FinanceiroPageModel, NucleusRevenueRow } from "./schema";

export function useFinanceiroPageModel(): FinanceiroPageModel {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [nuclei, setNuclei] = useState<CareNucleus[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [referralsRes, nucleiRes] = await Promise.all([
        fetch("/api/referrals", { cache: "no-store" }),
        fetch("/api/nuclei", { cache: "no-store" }),
      ]);
      const referralsData = (await referralsRes.json()) as Referral[];
      const nucleiData = (await nucleiRes.json()) as CareNucleus[];

      if (isMounted) {
        setReferrals(referralsData);
        setNuclei(nucleiData);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

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
