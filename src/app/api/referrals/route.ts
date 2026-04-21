import { NextResponse } from "next/server";

import { createReferral, listReferrals } from "@/features/referrals/service";

export async function GET() {
  return NextResponse.json(listReferrals());
}

export async function POST(request: Request) {
  const body = await request.json();

  const referral = createReferral({
    patientName: body.patientName,
    patientBirthDate: body.patientBirthDate,
    patientPhone: body.patientPhone,
    patientDocument: body.patientDocument,
    systemicDiseases: body.systemicDiseases,
    clinicalNotes: body.clinicalNotes,
    nucleusId: body.nucleusId,
    nucleusName: body.nucleusName,
    appointmentDate: body.appointmentDate,
    doctor: body.doctor,
    specialistNotes: body.specialistNotes,
    specialistConduct: body.specialistConduct,
    specialistAttachments: body.specialistAttachments,
    documents: body.documents,
  });

  return NextResponse.json(referral, { status: 201 });
}
