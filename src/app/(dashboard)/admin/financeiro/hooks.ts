"use client";

import { useCallback, useEffect, useState } from "react";

import {
  defaultPeriodRange,
  type PeriodPreset,
  rangeForPreset,
} from "@/features/financeiro/period";

import type { FinanceiroApiResponse, FinanceiroPageModel } from "./schema";

function buildQuery(params: {
  startDate: string;
  endDate: string;
  officeId: string;
  onlyAttended: boolean;
  onlyWithSurgery: boolean;
}) {
  const q = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });
  if (params.officeId) q.set("officeId", params.officeId);
  if (params.onlyAttended) q.set("onlyAttended", "true");
  if (params.onlyWithSurgery) q.set("onlyWithSurgery", "true");
  return q.toString();
}

export function useFinanceiroPageModel(): FinanceiroPageModel {
  const initial = defaultPeriodRange();
  const [draftStartDate, setDraftStartDate] = useState(initial.startDate);
  const [draftEndDate, setDraftEndDate] = useState(initial.endDate);
  const [draftOfficeId, setDraftOfficeId] = useState("");
  const [draftOnlyAttended, setDraftOnlyAttended] = useState(false);
  const [draftOnlyWithSurgery, setDraftOnlyWithSurgery] = useState(false);
  const [activePreset, setActivePreset] = useState<PeriodPreset | "custom">(
    "thisMonth",
  );

  const [applied, setApplied] = useState({
    startDate: initial.startDate,
    endDate: initial.endDate,
    officeId: "",
    onlyAttended: false,
    onlyWithSurgery: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FinanceiroApiResponse | null>(null);

  const load = useCallback(async (params: typeof applied) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/financeiro?${buildQuery(params)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setError("errors.loadFailed");
        setData(null);
        return;
      }
      const json = (await res.json()) as FinanceiroApiResponse;
      setData(json);
    } catch {
      setError("errors.loadFailed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(applied);
  }, [applied, load]);

  function applyPreset(preset: PeriodPreset) {
    const range = rangeForPreset(preset);
    setDraftStartDate(range.startDate);
    setDraftEndDate(range.endDate);
    setActivePreset(preset);
    setApplied((prev) => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  }

  function search() {
    setActivePreset("custom");
    setApplied({
      startDate: draftStartDate,
      endDate: draftEndDate,
      officeId: draftOfficeId,
      onlyAttended: draftOnlyAttended,
      onlyWithSurgery: draftOnlyWithSurgery,
    });
  }

  function clearFilters() {
    const range = defaultPeriodRange();
    setDraftStartDate(range.startDate);
    setDraftEndDate(range.endDate);
    setDraftOfficeId("");
    setDraftOnlyAttended(false);
    setDraftOnlyWithSurgery(false);
    setActivePreset("thisMonth");
    setApplied({
      startDate: range.startDate,
      endDate: range.endDate,
      officeId: "",
      onlyAttended: false,
      onlyWithSurgery: false,
    });
  }

  return {
    loading,
    error,
    data,
    draftStartDate,
    draftEndDate,
    draftOfficeId,
    draftOnlyAttended,
    draftOnlyWithSurgery,
    activePreset,
    setDraftStartDate: (v) => {
      setDraftStartDate(v);
      setActivePreset("custom");
    },
    setDraftEndDate: (v) => {
      setDraftEndDate(v);
      setActivePreset("custom");
    },
    setDraftOfficeId,
    setDraftOnlyAttended,
    setDraftOnlyWithSurgery,
    applyPreset,
    search,
    clearFilters,
  };
}
