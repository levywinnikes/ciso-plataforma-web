import {
  applyAppointmentRange,
  applyColumnFilters,
  applyStatusFilter,
  applyTabFilter,
  buildReferralOrderBy,
  parseColumnFilters,
  parsePageParams,
  parseSortParams,
} from "../list-query";

describe("parsePageParams", () => {
  it("returns null page when page is absent", () => {
    const result = parsePageParams(new URLSearchParams());
    expect(result.page).toBeNull();
  });

  it("clamps page and pageSize", () => {
    const result = parsePageParams(
      new URLSearchParams({ page: "0", pageSize: "999" }),
    );
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(100);
  });
});

describe("applyTabFilter", () => {
  it("filters blocked", () => {
    expect(applyTabFilter({}, "blocked").status).toBe("Bloqueado");
  });

  it("filters scheduled and attended", () => {
    expect(applyTabFilter({}, "pending").status).toBe("Encaminhado");
    expect(applyTabFilter({}, "scheduled").status).toBe("Agendado");
    expect(applyTabFilter({}, "attended").status).toBe("Atendido");
  });

  it("filters active excluding blocked", () => {
    expect(applyTabFilter({}, "active").status).toEqual({ not: "Bloqueado" });
  });

  it("filters overdue before local day start", () => {
    const now = new Date(2026, 7, 25, 15, 0, 0);
    const result = applyTabFilter({}, "overdue", now);
    expect(result.status).toEqual({ not: "Atendido" });
    expect(result.appointmentDate).toMatchObject({
      not: null,
      lt: new Date(2026, 7, 25, 0, 0, 0),
    });
  });
});

describe("applyStatusFilter and appointment range", () => {
  it("applies status when valid", () => {
    expect(applyStatusFilter({}, "Agendado").status).toBe("Agendado");
    expect(applyStatusFilter({}, "Nope")).toEqual({});
  });

  it("applies appointment range", () => {
    const result = applyAppointmentRange({}, "2026-08-01", "2026-08-31");
    expect(result.appointmentDate).toMatchObject({ not: null });
  });
});

describe("column filters and sort", () => {
  it("parses column filters", () => {
    expect(
      parseColumnFilters(
        new URLSearchParams({
          patient: " Ana ",
          office: "Grupo",
          empty: "",
        }),
      ),
    ).toEqual({
      patient: "Ana",
      office: "Grupo",
      clinic: undefined,
      doctor: undefined,
      createdBy: undefined,
    });
  });

  it("applies contains filters", () => {
    const where = applyColumnFilters(
      {},
      { patient: "Maria", clinic: "Canto", doctor: "Fran" },
    );
    expect(where.AND).toEqual(
      expect.arrayContaining([
        {
          patientName: { contains: "Maria", mode: "insensitive" },
        },
        {
          clinic: { name: { contains: "Canto", mode: "insensitive" } },
        },
        {
          doctor: { contains: "Fran", mode: "insensitive" },
        },
      ]),
    );
  });

  it("parses sort with defaults", () => {
    expect(parseSortParams(new URLSearchParams())).toEqual({
      sortBy: "createdAt",
      sortDir: "desc",
    });
    expect(
      parseSortParams(
        new URLSearchParams({ sortBy: "patientName", sortDir: "desc" }),
      ),
    ).toEqual({ sortBy: "patientName", sortDir: "desc" });
  });

  it("builds orderBy for nested fields", () => {
    expect(buildReferralOrderBy("clinic", "asc")).toEqual([
      { clinic: { name: "asc" } },
      { createdAt: "desc" },
    ]);
  });
});
