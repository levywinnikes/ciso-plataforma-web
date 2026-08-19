import { aggregateFinanceiro, countReferralTotals } from "../queries";

describe("countReferralTotals", () => {
  it("counts overdue only when the appointment day is before today and not completed", () => {
    const now = new Date(2026, 7, 19);
    const totals = countReferralTotals(
      [
        { status: "Agendado", appointmentDate: new Date(2026, 7, 18) },
        { status: "Agendado", appointmentDate: new Date(2026, 7, 19) },
        { status: "Atendido", appointmentDate: new Date(2026, 7, 10) },
        { status: "Bloqueado", appointmentDate: null },
      ],
      now,
    );

    expect(totals.total).toBe(4);
    expect(totals.atrasados).toBe(1);
    expect(totals.bloqueados).toBe(1);
    expect(totals.atendidos).toBe(1);
  });
});

describe("aggregateFinanceiro", () => {
  const nuclei = [
    { id: "n1", name: "Retina", chargedPrice: 100 },
    { id: "n2", name: "Catarata", chargedPrice: 50 },
  ];

  it("excludes blocked referrals from revenue", () => {
    const result = aggregateFinanceiro(
      [
        {
          status: "Bloqueado",
          createdAt: "2026-08-01T12:00:00.000Z",
          officeId: "o1",
          nucleusId: "n1",
        },
        {
          status: "Atendido",
          createdAt: "2026-08-01T12:00:00.000Z",
          officeId: "o1",
          nucleusId: "n1",
        },
      ],
      nuclei,
    );

    expect(result.quantidadeNoRecorte).toBe(1);
    expect(result.receitaTotal).toBe(100);
    expect(result.atendidos).toBe(1);
  });

  it("filters by office and period", () => {
    const result = aggregateFinanceiro(
      [
        {
          status: "Encaminhado",
          createdAt: "2026-08-10T12:00:00.000Z",
          officeId: "o1",
          nucleusId: "n2",
        },
        {
          status: "Encaminhado",
          createdAt: "2026-07-10T12:00:00.000Z",
          officeId: "o1",
          nucleusId: "n2",
        },
        {
          status: "Encaminhado",
          createdAt: "2026-08-10T12:00:00.000Z",
          officeId: "o2",
          nucleusId: "n2",
        },
      ],
      nuclei,
      { startDate: "2026-08-01", endDate: "2026-08-31", officeId: "o1" },
    );

    expect(result.quantidadeNoRecorte).toBe(1);
    expect(result.encaminhados).toBe(1);
    expect(result.receitaTotal).toBe(50);
  });
});
