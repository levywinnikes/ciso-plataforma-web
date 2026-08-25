import type { ReferralCounts } from "./list-query";
import type { Referral } from "./types";

export type ReferralsPageResult = {
  items: Referral[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  counts?: ReferralCounts;
};

export type FetchReferralsParams = {
  page?: number;
  pageSize?: number;
  tab?: "active" | "blocked" | "overdue";
  status?: string;
  appointmentFrom?: string;
  appointmentTo?: string;
  includeCounts?: boolean;
};

function buildQuery(params: FetchReferralsParams): string {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));
  if (params.tab) qs.set("tab", params.tab);
  if (params.status && params.status !== "ALL") qs.set("status", params.status);
  if (params.appointmentFrom) qs.set("appointmentFrom", params.appointmentFrom);
  if (params.appointmentTo) qs.set("appointmentTo", params.appointmentTo);
  if (params.includeCounts) qs.set("includeCounts", "1");
  const encoded = qs.toString();
  return encoded ? `?${encoded}` : "";
}

export async function fetchReferralsPage(
  params: FetchReferralsParams,
): Promise<ReferralsPageResult> {
  if (params.page == null) {
    throw new Error("fetchReferralsPage requires page");
  }
  const response = await fetch(`/api/referrals${buildQuery(params)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("referrals_fetch_failed");
  }
  return (await response.json()) as ReferralsPageResult;
}

export async function fetchReferralsAll(
  params: Omit<FetchReferralsParams, "page" | "pageSize"> = {},
): Promise<Referral[]> {
  const response = await fetch(`/api/referrals${buildQuery(params)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("referrals_fetch_failed");
  }
  const body = await response.json();
  if (Array.isArray(body)) return body as Referral[];
  return (body as ReferralsPageResult).items ?? [];
}
