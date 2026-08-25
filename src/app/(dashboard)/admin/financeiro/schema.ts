import { z } from "zod";

export const financeiroFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  officeId: z.string().optional(),
  onlyAttended: z.boolean(),
  onlyWithSurgery: z.boolean(),
});

export type FinanceiroFilterForm = z.infer<typeof financeiroFilterSchema>;

export type PeriodPreset = "today" | "thisMonth" | "lastMonth" | "last30";

export type FinanceiroSummary = {
  encaminhado: number;
  agendado: number;
  atendido: number;
  withSurgery: number;
  commissionNucleus: number;
  commissionSurgery: number;
  commissionTotal: number;
  itemCount: number;
};

export type FinanceiroBreakdownRow = {
  id: string;
  name: string;
  count: number;
  commission: number;
};

export type FinanceiroStatusRow = {
  status: string;
  count: number;
};

export type FinanceiroListItem = {
  id: string;
  patientName: string;
  status: string;
  referenceDate: string;
  officeName: string;
  clinicName: string;
  nucleusName: string;
  nucleusCommission: number;
  surgeryName: string | null;
  surgeryCommission: number;
  doctor: string | null;
  billable: boolean;
};

export type FinanceiroApiResponse = {
  period: { startDate: string; endDate: string };
  filters: {
    officeId: string | null;
    onlyAttended: boolean;
    onlyWithSurgery: boolean;
  };
  offices: { id: string; name: string }[];
  summary: FinanceiroSummary;
  byNucleus: FinanceiroBreakdownRow[];
  bySurgery: FinanceiroBreakdownRow[];
  byStatus: FinanceiroStatusRow[];
  items: FinanceiroListItem[];
};

export type FinanceiroPageModel = {
  loading: boolean;
  error: string | null;
  data: FinanceiroApiResponse | null;
  draftStartDate: string;
  draftEndDate: string;
  draftOfficeId: string;
  draftOnlyAttended: boolean;
  draftOnlyWithSurgery: boolean;
  activePreset: PeriodPreset | "custom";
  setDraftStartDate: (v: string) => void;
  setDraftEndDate: (v: string) => void;
  setDraftOfficeId: (v: string) => void;
  setDraftOnlyAttended: (v: boolean) => void;
  setDraftOnlyWithSurgery: (v: boolean) => void;
  applyPreset: (preset: PeriodPreset) => void;
  search: () => void;
  clearFilters: () => void;
};
