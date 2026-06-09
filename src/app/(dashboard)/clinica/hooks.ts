"use client";

import { useEffect, useMemo, useState } from "react";

import type { Referral } from "@/features/referrals/types";

import type { ClinicaPageModel } from "./schema";

export function useClinicaPageModel(): ClinicaPageModel {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadReferrals() {
      const response = await fetch("/api/referrals", { cache: "no-store" });
      const data = (await response.json()) as Referral[];

      if (isMounted) {
        setReferrals(
          data.filter(
            (referral) =>
              referral.status === "Agendado" || referral.status === "Atendido",
          ),
        );
      }
    }

    void loadReferrals();

    return () => {
      isMounted = false;
    };
  }, []);

  const agendadosCount = useMemo(
    () => referrals.filter((item) => item.status === "Agendado").length,
    [referrals],
  );

  const atendidosCount = useMemo(
    () => referrals.filter((item) => item.status === "Atendido").length,
    [referrals],
  );

  return {
    referrals,
    agendadosCount,
    atendidosCount,
  };
}
