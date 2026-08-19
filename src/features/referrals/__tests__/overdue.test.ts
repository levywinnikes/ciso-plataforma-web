import {
  canAdminMarkAsAttended,
  isReferralOverdue,
} from "@/features/referrals/overdue";

describe("isReferralOverdue", () => {
  const now = new Date(2026, 7, 19, 14, 0, 0);

  it("marks a scheduled referral from a previous calendar day as overdue", () => {
    expect(
      isReferralOverdue(
        {
          status: "Agendado",
          appointmentDate: new Date(2026, 7, 18, 9, 0, 0).toISOString(),
        },
        now,
      ),
    ).toBe(true);
  });

  it("does not mark a referral scheduled for today as overdue", () => {
    expect(
      isReferralOverdue(
        {
          status: "Agendado",
          appointmentDate: new Date(2026, 7, 19, 8, 0, 0).toISOString(),
        },
        now,
      ),
    ).toBe(false);
  });

  it("ignores completed referrals even with a past appointment", () => {
    expect(
      isReferralOverdue(
        {
          status: "Atendido",
          appointmentDate: new Date(2026, 7, 1, 9, 0, 0).toISOString(),
        },
        now,
      ),
    ).toBe(false);
  });

  it("ignores referrals without an appointment date", () => {
    expect(
      isReferralOverdue({ status: "Encaminhado", appointmentDate: null }, now),
    ).toBe(false);
  });
});

describe("canAdminMarkAsAttended", () => {
  it("allows pending operational statuses only", () => {
    expect(canAdminMarkAsAttended("Encaminhado")).toBe(true);
    expect(canAdminMarkAsAttended("Agendado")).toBe(true);
    expect(canAdminMarkAsAttended("Bloqueado")).toBe(false);
    expect(canAdminMarkAsAttended("Atendido")).toBe(false);
  });
});
