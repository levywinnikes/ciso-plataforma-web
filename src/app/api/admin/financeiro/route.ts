import { NextResponse } from "next/server";

import {
  aggregateFinanceiro,
  type FinanceiroReferralRow,
} from "@/features/financeiro/aggregate";
import { defaultPeriodRange } from "@/features/financeiro/period";
import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/financeiro
 * Agregados de comissão pós-médico para o painel administrativo.
 * Ver docs/ai/financeiro.md
 */
export async function GET(request: Request) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const defaults = defaultPeriodRange();
  const startDate = searchParams.get("startDate") || defaults.startDate;
  const endDate = searchParams.get("endDate") || defaults.endDate;
  const officeId = searchParams.get("officeId") || undefined;
  const onlyAttended = searchParams.get("onlyAttended") === "true";
  const onlyWithSurgery = searchParams.get("onlyWithSurgery") === "true";

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return apiError("errors.invalidData", 400);
  }

  const [referrals, offices] = await Promise.all([
    prisma.referral.findMany({
      where: { status: { not: "Bloqueado" } },
      include: {
        clinic: { select: { name: true } },
        office: { select: { name: true } },
        surgery: { select: { id: true, name: true } },
        statusAudits: {
          where: { toStatus: "Atendido" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findMany({
      where: { type: "PROFISSIONAL_GROUP" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows: FinanceiroReferralRow[] = referrals.map((item) => ({
    id: item.id,
    patientName: item.patientName,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    completedAt: item.statusAudits[0]?.createdAt ?? null,
    officeId: item.officeId,
    officeName: item.office.name,
    clinicName: item.clinic.name,
    nucleusId: item.nucleusId,
    nucleusName: item.nucleusSnapshotName,
    nucleusPrice: Number(item.nucleusSnapshotPrice),
    surgeryId: item.surgeryId,
    surgeryName: item.surgery?.name ?? null,
    surgeryPrice: item.surgeryPrice != null ? Number(item.surgeryPrice) : null,
    doctor: item.doctor,
  }));

  const aggregated = aggregateFinanceiro(rows, {
    startDate,
    endDate,
    officeId,
    onlyAttended,
    onlyWithSurgery,
  });

  return NextResponse.json({
    period: { startDate, endDate },
    filters: {
      officeId: officeId ?? null,
      onlyAttended,
      onlyWithSurgery,
    },
    offices,
    ...aggregated,
  });
}
