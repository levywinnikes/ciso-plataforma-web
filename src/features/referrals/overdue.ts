import type { ReferralStatus } from "./types";

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isReferralOverdue(
  referral: {
    status: ReferralStatus;
    appointmentDate?: string | null;
  },
  now: Date = new Date(),
): boolean {
  if (referral.status === "Atendido") {
    return false;
  }

  if (!referral.appointmentDate) {
    return false;
  }

  const appointment = new Date(referral.appointmentDate);
  if (Number.isNaN(appointment.getTime())) {
    return false;
  }

  return startOfLocalDay(appointment) < startOfLocalDay(now);
}

export function canAdminMarkAsAttended(status: ReferralStatus): boolean {
  return status === "Encaminhado" || status === "Agendado";
}
