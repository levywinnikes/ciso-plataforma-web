"use client";

import { useEffect, useMemo, useState } from "react";

import type { CareNucleus, Referral } from "@/features/referrals/types";

import type { FinanceiroPageModel, NucleusRevenueRow } from "./schema";

export function useFinanceiroPageModel(): FinanceiroPageModel {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [nuclei, setNuclei] = useState<CareNucleus[]>([]);

  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableOffices, setAvailableOffices] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [referralsRes, nucleiRes, officesRes] = await Promise.all([
        fetch("/api/referrals", { cache: "no-store" }),
        fetch("/api/nuclei", { cache: "no-store" }),
        fetch("/api/organizations?type=PROFISSIONAL_GROUP", {
          cache: "no-store",
        }),
      ]);
      const referralsData = (await referralsRes.json()) as Referral[];
      const nucleiData = (await nucleiRes.json()) as CareNucleus[];
      const officesData = await officesRes.json();

      if (isMounted) {
        setReferrals(referralsData);
        setNuclei(nucleiData);
        if (Array.isArray(officesData)) {
          setAvailableOffices(
            officesData.map((o: any) => ({ id: o.id, name: o.name })),
          );
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      let matches = true;
      if (selectedOfficeId && item.officeId !== selectedOfficeId) {
        matches = false;
      }
      if (startDate && item.createdAt) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(item.createdAt) < start) {
          matches = false;
        }
      }
      if (endDate && item.createdAt) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(item.createdAt) > end) {
          matches = false;
        }
      }
      return matches;
    });
  }, [referrals, selectedOfficeId, startDate, endDate]);

  const totalReceita = useMemo(
    () =>
      filteredReferrals.reduce((sum, referral) => {
        const nucleus = nuclei.find((item) => item.id === referral.nucleusId);
        return sum + (nucleus?.chargedPrice ?? 0);
      }, 0),
    [nuclei, filteredReferrals],
  );

  const encaminhadosCount = useMemo(
    () =>
      filteredReferrals.filter((item) => item.status === "Encaminhado").length,
    [filteredReferrals],
  );

  const agendadosCount = useMemo(
    () => filteredReferrals.filter((item) => item.status === "Agendado").length,
    [filteredReferrals],
  );

  const atendidosCount = useMemo(
    () => filteredReferrals.filter((item) => item.status === "Atendido").length,
    [filteredReferrals],
  );

  const revenueRows = useMemo<NucleusRevenueRow[]>(
    () =>
      nuclei.map((nucleus) => {
        const count = filteredReferrals.filter(
          (item) => item.nucleusId === nucleus.id,
        ).length;

        return {
          nucleus,
          count,
          revenue: count * nucleus.chargedPrice,
        };
      }),
    [nuclei, filteredReferrals],
  );

  return {
    referrals,
    nuclei,
    totalReceita,
    encaminhadosCount,
    agendadosCount,
    atendidosCount,
    revenueRows,
    selectedOfficeId,
    startDate,
    endDate,
    availableOffices,
    setSelectedOfficeId,
    setStartDate,
    setEndDate,
  };
}
