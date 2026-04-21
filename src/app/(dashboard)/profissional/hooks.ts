"use client";

import { listReferrals } from "@/features/referrals/service";

import type { ProfissionalPageModel } from "./schema";

export function useProfissionalPageModel(): ProfissionalPageModel {
  const referrals = listReferrals();

  return { referrals };
}
