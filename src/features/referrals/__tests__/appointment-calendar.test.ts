import {
  civilDayKey,
  filterCalendarReferrals,
  groupReferralsByCivilDay,
  monthBoundsIso,
} from "../appointment-calendar-utils";
import type { Referral } from "../types";

const base: Referral = {
  id: "1",
  patientName: "Ana",
  patientBirthDate: "2000-01-01",
  patientPhone: "11999999999",
  createdAt: "2026-08-01T12:00:00.000Z",
  status: "Agendado",
  nucleusId: "n1",
  nucleusName: "Retina",
};

describe("appointment-calendar-utils", () => {
  it("groups by civil day and sorts by time", () => {
    const referrals: Referral[] = [
      {
        ...base,
        id: "a",
        appointmentDate: "2026-08-20T15:00:00.000Z",
      },
      {
        ...base,
        id: "b",
        patientName: "Bruno",
        appointmentDate: "2026-08-20T10:00:00.000Z",
      },
      {
        ...base,
        id: "c",
        status: "Encaminhado",
      },
    ];
    const map = groupReferralsByCivilDay(referrals);
    const key = civilDayKey("2026-08-20T15:00:00.000Z");
    expect(map.get(key)?.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("filters overdue only", () => {
    const now = new Date(2026, 7, 21);
    const referrals: Referral[] = [
      {
        ...base,
        id: "late",
        appointmentDate: new Date(2026, 7, 18, 10).toISOString(),
      },
      {
        ...base,
        id: "ok",
        appointmentDate: new Date(2026, 7, 22, 10).toISOString(),
      },
      {
        ...base,
        id: "done",
        status: "Atendido",
        appointmentDate: new Date(2026, 7, 10, 10).toISOString(),
      },
    ];
    const overdue = filterCalendarReferrals(referrals, "atrasados", now);
    expect(overdue.map((item) => item.id)).toEqual(["late"]);
  });

  it("builds ISO bounds covering the visible grid (leading/trailing days)", () => {
    // Agosto/2026 começa no sábado → grade inclui 26/07 … 05/09
    const bounds = monthBoundsIso(new Date(2026, 7, 15));
    expect(bounds.appointmentFrom).toBe("2026-07-26");
    expect(bounds.appointmentTo).toBe("2026-09-05");
  });
});
