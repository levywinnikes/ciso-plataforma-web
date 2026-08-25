import { describe, expect, it } from "vitest";

import {
  applyAppointmentRange,
  applyStatusFilter,
  applyTabFilter,
  parsePageParams,
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
