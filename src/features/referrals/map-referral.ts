import { resolveDocumentUrl } from "@/lib/storage";

type ReferralLike = {
  id: string;
  patientName: string;
  patientBirthDate: Date;
  patientPhone: string;
  patientDocument: string | null;
  systemicDiseases: string | null;
  clinicalNotes: string | null;
  clinicalSuspicion: string | null;
  status: "Encaminhado" | "Agendado" | "Atendido";
  doctor: string | null;
  appointmentDate: Date | null;
  specialistNotes: string | null;
  specialistConduct: string | null;
  createdAt: Date;
  nucleusId: string;
  nucleusSnapshotName: string;
  nucleusSnapshotPrice: unknown;
  nucleusSnapshotServices?: unknown;
  clinicId: string;
  clinic: { name: string };
  officeId: string;
  office: { name: string };
  createdByUserId: string;
  createdByUser: { name: string; email: string };
  nucleus: { name: string };
  documents: Array<{
    id: string;
    fileName: string;
    url: string | null;
    createdAt: Date;
  }>;
  specialistFiles: Array<{
    id: string;
    fileName: string;
    url: string | null;
    createdAt: Date;
  }>;
  agreementId: string | null;
  agreement: { name: string } | null;
  surgeryId?: string | null;
  surgery?: { name: string } | null;
  surgeryPrice?: unknown;
};

export async function mapReferralResponse(referral: ReferralLike) {
  const documents = await Promise.all(
    referral.documents.map(async (item) => ({
      id: item.id,
      name: item.fileName,
      key: item.url ?? undefined,
      url: await resolveDocumentUrl(item.url),
      uploadedAt: item.createdAt.toISOString(),
    })),
  );

  const specialistAttachments = await Promise.all(
    referral.specialistFiles.map(async (item) => ({
      id: item.id,
      name: item.fileName,
      key: item.url ?? undefined,
      url: await resolveDocumentUrl(item.url),
      uploadedAt: item.createdAt.toISOString(),
    })),
  );

  return {
    id: referral.id,
    patientName: referral.patientName,
    patientBirthDate: referral.patientBirthDate.toISOString().slice(0, 10),
    patientPhone: referral.patientPhone,
    patientDocument: referral.patientDocument ?? undefined,
    systemicDiseases: referral.systemicDiseases ?? undefined,
    clinicalNotes: referral.clinicalNotes ?? undefined,
    clinicalSuspicion: referral.clinicalSuspicion ?? undefined,
    createdAt: referral.createdAt.toISOString().slice(0, 10),
    status: referral.status,
    nucleusId: referral.nucleusId,
    nucleusName: referral.nucleusSnapshotName,
    nucleusPrice: Number(referral.nucleusSnapshotPrice),
    nucleusSnapshotServices: referral.nucleusSnapshotServices as
      | Array<{ name: string; basePrice: number }>
      | undefined,
    clinicId: referral.clinicId,
    clinicName: referral.clinic.name,
    officeId: referral.officeId,
    officeName: referral.office.name,
    agreementId: referral.agreementId ?? undefined,
    agreementName: referral.agreement?.name ?? undefined,
    surgeryId: referral.surgeryId ?? undefined,
    surgeryName: referral.surgery?.name ?? undefined,
    surgeryPrice: referral.surgeryPrice
      ? Number(referral.surgeryPrice)
      : undefined,
    createdByUserId: referral.createdByUserId,
    createdByUserName: referral.createdByUser.name,
    appointmentDate: referral.appointmentDate?.toISOString() ?? undefined,
    doctor: referral.doctor ?? undefined,
    specialistNotes: referral.specialistNotes ?? undefined,
    specialistConduct: referral.specialistConduct ?? undefined,
    documents,
    specialistAttachments,
  };
}
