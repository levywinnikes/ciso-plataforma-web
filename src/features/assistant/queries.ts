import { readFile } from "node:fs/promises";
import path from "node:path";

import { isReferralOverdue } from "@/features/referrals/overdue";
import type { ReferralStatus } from "@/features/referrals/types";
import { prisma, withPrismaRetry } from "@/lib/prisma";

import { ASSISTANT_PRODUCT_GUIDANCE } from "./product-guidance";

export const ASSISTANT_QUERY_SOURCES = [
  "totais_encaminhamentos",
  "resumo_financeiro",
  "totais_cadastros",
] as const;

export type AssistantQuerySource = (typeof ASSISTANT_QUERY_SOURCES)[number];

export type FinanceiroFilters = {
  startDate?: string;
  endDate?: string;
  officeId?: string;
};

export type ReferralTotalRow = {
  status: ReferralStatus;
  appointmentDate: Date | string | null;
};

export type FinanceiroReferralRow = {
  status: ReferralStatus;
  createdAt: Date | string;
  officeId: string;
  nucleusId: string;
};

export type NucleusPriceRow = {
  id: string;
  name: string;
  chargedPrice: number;
};

export function countReferralTotals(
  rows: ReferralTotalRow[],
  now = new Date(),
) {
  const byStatus: Record<ReferralStatus, number> = {
    Bloqueado: 0,
    Encaminhado: 0,
    Agendado: 0,
    Atendido: 0,
  };

  for (const row of rows) {
    byStatus[row.status] += 1;
  }

  const overdue = rows.filter((row) =>
    isReferralOverdue(
      {
        status: row.status,
        appointmentDate: row.appointmentDate
          ? new Date(row.appointmentDate).toISOString()
          : null,
      },
      now,
    ),
  ).length;

  return {
    total: rows.length,
    bloqueados: byStatus.Bloqueado,
    encaminhados: byStatus.Encaminhado,
    agendados: byStatus.Agendado,
    atendidos: byStatus.Atendido,
    atrasados: overdue,
  };
}

export function isWithinCreatedAtRange(
  createdAt: Date | string,
  filters: FinanceiroFilters,
): boolean {
  const created = new Date(createdAt);
  if (filters.startDate) {
    const start = new Date(`${filters.startDate}T00:00:00`);
    if (created < start) return false;
  }
  if (filters.endDate) {
    const end = new Date(`${filters.endDate}T23:59:59.999`);
    if (created > end) return false;
  }
  return true;
}

export function aggregateFinanceiro(
  referrals: FinanceiroReferralRow[],
  nuclei: NucleusPriceRow[],
  filters: FinanceiroFilters = {},
) {
  const priceByNucleus = new Map(nuclei.map((item) => [item.id, item]));

  const filtered = referrals.filter((item) => {
    if (item.status === "Bloqueado") return false;
    if (filters.officeId && item.officeId !== filters.officeId) return false;
    return isWithinCreatedAtRange(item.createdAt, filters);
  });

  let receitaTotal = 0;
  let encaminhados = 0;
  let agendados = 0;
  let atendidos = 0;
  const porNucleo = nuclei.map((nucleus) => ({
    nucleo: nucleus.name,
    quantidade: 0,
    receita: 0,
  }));
  const indexById = new Map(
    nuclei.map((nucleus, index) => [nucleus.id, index]),
  );

  for (const item of filtered) {
    if (item.status === "Encaminhado") encaminhados += 1;
    if (item.status === "Agendado") agendados += 1;
    if (item.status === "Atendido") atendidos += 1;

    const nucleus = priceByNucleus.get(item.nucleusId);
    const price = nucleus?.chargedPrice ?? 0;
    receitaTotal += price;
    const index = indexById.get(item.nucleusId);
    if (index !== undefined) {
      porNucleo[index].quantidade += 1;
      porNucleo[index].receita += price;
    }
  }

  return {
    quantidadeNoRecorte: filtered.length,
    encaminhados,
    agendados,
    atendidos,
    receitaTotal,
    porNucleo: porNucleo.filter((row) => row.quantidade > 0),
  };
}

async function loadManual(): Promise<string> {
  try {
    const filePath = path.join(
      process.cwd(),
      "docs",
      "ai",
      "assistant-knowledge.md",
    );
    return await readFile(filePath, "utf8");
  } catch {
    return ASSISTANT_PRODUCT_GUIDANCE;
  }
}

export async function loadAssistantManual(): Promise<string> {
  return loadManual();
}

type LiveRows = Awaited<ReturnType<typeof fetchLiveRows>>;

async function fetchLiveRows() {
  return withPrismaRetry(() =>
    prisma.$transaction([
      prisma.referral.findMany({
        select: {
          status: true,
          appointmentDate: true,
          createdAt: true,
          officeId: true,
          nucleusId: true,
        },
      }),
      prisma.careNucleus.findMany({
        select: { id: true, name: true, chargedPrice: true },
      }),
      prisma.organization.groupBy({
        by: ["type"],
        _count: { _all: true },
        orderBy: { type: "asc" },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
        orderBy: { role: "asc" },
      }),
      prisma.agreement.count(),
      prisma.careService.count(),
      prisma.surgery.count(),
    ]),
  );
}

function mapNuclei(rows: LiveRows[1]): NucleusPriceRow[] {
  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    chargedPrice: Number(item.chargedPrice),
  }));
}

function mapCadastros(
  nucleiCount: number,
  orgByType: LiveRows[2],
  usersByRole: LiveRows[3],
  convenios: number,
  servicos: number,
  cirurgias: number,
) {
  const papel = {
    administrativo: 0,
    medico: 0,
    profissional: 0,
  };

  for (const row of usersByRole) {
    const total = row._count?._all ?? 0;
    if (row.role === "ADMINISTRATIVO") papel.administrativo = total;
    if (row.role === "MEDICO") papel.medico = total;
    if (row.role === "PROFISSIONAL") papel.profissional = total;
  }

  const clinicas =
    orgByType.find((row) => row.type === "CLINICA")?._count?._all ?? 0;
  const consultorios =
    orgByType.find((row) => row.type === "PROFISSIONAL_GROUP")?._count?._all ??
    0;

  return {
    clinicas,
    consultorios,
    nucleos: nucleiCount,
    convenios,
    servicos,
    cirurgias,
    usuarios: papel.administrativo + papel.medico + papel.profissional,
    usuariosPorPapel: papel,
  };
}

export async function loadAssistantResearchPack(
  filters: FinanceiroFilters = {},
) {
  const [
    referrals,
    nuclei,
    orgByType,
    usersByRole,
    convenios,
    servicos,
    cirurgias,
  ] = await fetchLiveRows();
  const nucleusRows = mapNuclei(nuclei);

  return {
    encaminhamentos: countReferralTotals(referrals),
    financeiro: aggregateFinanceiro(referrals, nucleusRows, filters),
    cadastros: mapCadastros(
      nuclei.length,
      orgByType,
      usersByRole,
      convenios,
      servicos,
      cirurgias,
    ),
  };
}

export async function queryReferralTotals() {
  const pack = await loadAssistantResearchPack();
  return pack.encaminhamentos;
}

export async function queryFinanceiroSummary(filters: FinanceiroFilters = {}) {
  const pack = await loadAssistantResearchPack(filters);
  return pack.financeiro;
}

export async function queryCadastroTotals() {
  const pack = await loadAssistantResearchPack();
  return pack.cadastros;
}

function money(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en-US" ? "en-US" : "pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatResearchPackForModel(
  pack: Awaited<ReturnType<typeof loadAssistantResearchPack>>,
  locale: string,
): string {
  const { encaminhamentos, financeiro, cadastros } = pack;
  const nucleusLines =
    financeiro.porNucleo.length === 0
      ? "- nenhum núcleo com encaminhamento no recorte"
      : financeiro.porNucleo
          .map(
            (row) =>
              `- ${row.nucleo}: ${row.quantidade} encaminhamentos, ${money(row.receita, locale)}`,
          )
          .join("\n");

  return `
Números ao vivo do sistema (use estes valores; não invente):

Encaminhamentos:
- total: ${encaminhamentos.total}
- Encaminhado: ${encaminhamentos.encaminhados}
- Agendado: ${encaminhamentos.agendados}
- Atendido: ${encaminhamentos.atendidos}
- Bloqueado: ${encaminhamentos.bloqueados}
- Atrasado: ${encaminhamentos.atrasados}

Cadastros (só quantidades):
- clínicas: ${cadastros.clinicas}
- consultórios: ${cadastros.consultorios}
- núcleos: ${cadastros.nucleos}
- convênios: ${cadastros.convenios}
- serviços: ${cadastros.servicos}
- cirurgias: ${cadastros.cirurgias}
- usuários: ${cadastros.usuarios} (administrativo ${cadastros.usuariosPorPapel.administrativo}, médico ${cadastros.usuariosPorPapel.medico}, profissional ${cadastros.usuariosPorPapel.profissional})

Financeiro (sem Bloqueado; mesmo critério da tela Financeiro / Relatórios):
- quantidade no recorte: ${financeiro.quantidadeNoRecorte}
- Encaminhado: ${financeiro.encaminhados}
- Agendado: ${financeiro.agendados}
- Atendido: ${financeiro.atendidos}
- receita total: ${money(financeiro.receitaTotal, locale)}
Por núcleo:
${nucleusLines}
`.trim();
}
