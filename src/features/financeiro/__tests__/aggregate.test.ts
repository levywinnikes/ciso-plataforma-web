import {
  aggregateFinanceiro,
  type FinanceiroReferralRow,
} from "@/features/financeiro/aggregate";
import { rangeForPreset } from "@/features/financeiro/period";

function row(
  partial: Partial<FinanceiroReferralRow> & Pick<FinanceiroReferralRow, "id">,
): FinanceiroReferralRow {
  return {
    patientName: "Paciente",
    status: "Atendido",
    createdAt: new Date(2026, 7, 10),
    updatedAt: new Date(2026, 7, 12),
    completedAt: new Date(2026, 7, 12),
    officeId: "off-1",
    officeName: "Consultorio",
    clinicName: "Clinica",
    nucleusId: "nuc-1",
    nucleusName: "Nucleo A",
    nucleusPrice: 100,
    surgeryId: null,
    surgeryName: null,
    surgeryPrice: null,
    doctor: "Dr",
    ...partial,
  };
}

describe("financeiro aggregate", () => {
  it("sums nucleus and surgery commissions only for Atendido", () => {
    const rows = [
      row({
        id: "1",
        status: "Atendido",
        surgeryId: "s1",
        surgeryName: "Capsulo",
        surgeryPrice: 500,
      }),
      row({
        id: "2",
        status: "Agendado",
        createdAt: new Date(2026, 7, 15),
        completedAt: null,
        nucleusPrice: 100,
        surgeryId: "s1",
        surgeryName: "Capsulo",
        surgeryPrice: 500,
      }),
    ];

    const result = aggregateFinanceiro(rows, {
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });

    expect(result.summary.commissionNucleus).toBe(100);
    expect(result.summary.commissionSurgery).toBe(500);
    expect(result.summary.commissionTotal).toBe(600);
    expect(result.summary.withSurgery).toBe(2);
    expect(result.bySurgery[0]?.commission).toBe(500);
  });

  it("filters onlyWithSurgery", () => {
    const rows = [
      row({ id: "1", surgeryId: "s1", surgeryPrice: 200 }),
      row({ id: "2", surgeryId: null }),
    ];
    const result = aggregateFinanceiro(rows, {
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      onlyWithSurgery: true,
    });
    expect(result.summary.itemCount).toBe(1);
  });
});

describe("financeiro period presets", () => {
  it("builds this month and last month ranges", () => {
    const now = new Date(2026, 7, 25);
    expect(rangeForPreset("thisMonth", now)).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });
    expect(rangeForPreset("lastMonth", now)).toEqual({
      startDate: "2026-07-01",
      endDate: "2026-07-31",
    });
    expect(rangeForPreset("today", now)).toEqual({
      startDate: "2026-08-25",
      endDate: "2026-08-25",
    });
  });
});
