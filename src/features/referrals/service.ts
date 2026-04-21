import { CARE_NUCLEI, INITIAL_REFERRALS } from "./data";
import type { CareNucleus, Referral, ReferralDocument } from "./types";

let referralsStore: Referral[] = [...INITIAL_REFERRALS];

export function listNuclei(): CareNucleus[] {
  return CARE_NUCLEI;
}

export function listReferrals(): Referral[] {
  return referralsStore;
}

export function getReferralById(id: string): Referral | undefined {
  return referralsStore.find((referral) => referral.id === id);
}

export function createReferral(
  payload: Omit<Referral, "id" | "createdAt" | "status">,
): Referral {
  const nextReferral: Referral = {
    ...payload,
    id: `REF-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    status: "Encaminhado",
  };

  referralsStore = [nextReferral, ...referralsStore];
  return nextReferral;
}

export function updateReferralSchedule(input: {
  referralId: string;
  doctor: string;
  appointmentDate: string;
}): Referral | null {
  const referral = referralsStore.find((item) => item.id === input.referralId);

  if (!referral) {
    return null;
  }

  referral.doctor = input.doctor;
  referral.appointmentDate = input.appointmentDate;
  referral.status = "Agendado";

  return referral;
}

export function appendSpecialistUpdate(input: {
  referralId: string;
  notes?: string;
  conduct?: string;
  files?: ReferralDocument[];
}): Referral | null {
  const referral = referralsStore.find((item) => item.id === input.referralId);

  if (!referral) {
    return null;
  }

  if (input.notes) {
    referral.specialistNotes = input.notes;
  }

  if (input.conduct) {
    referral.specialistConduct = input.conduct;
  }

  if (input.files?.length) {
    const currentFiles = referral.specialistAttachments ?? [];
    referral.specialistAttachments = [...currentFiles, ...input.files];
  }

  if (input.notes || input.conduct || input.files?.length) {
    referral.status = "Atendido";
  }

  return referral;
}
