"use client";

import { useEffect, useState } from "react";

import type { Referral } from "@/features/referrals/types";

import type { ProfissionalPageModel } from "./schema";

export function useProfissionalPageModel(): ProfissionalPageModel {
  const [referrals, setReferrals] = useState<Referral[]>([]);

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

  return { referrals };
}
