import { isReferralOverdue } from "@/features/referrals/overdue";
import type { ReferralStatus } from "@/features/referrals/types";
import { prisma, withPrismaRetry } from "@/lib/prisma";

import {
  type AssistantConsulta,
  assistantConsultaSchema,
} from "./consulta-schema";

const MAX_ROWS = 40;

export type ReferralFact = {
  status: ReferralStatus;
  appointmentDate: Date | string | null;
  createdAt: Date | string;
  clinicName: string;
  officeName: string;
  nucleusName: string;
  nucleusPrice: number;
};

export type CadastroSnapshot = {
  clinicas: number;
  consultorios: number;
  nucleos: number;
  convenios: number;
  servicos: number;
  cirurgias: number;
  usuariosPorPapel: {
    administrativo: number;
    medico: number;
    profissional: number;
  };
};

export type ConsultaLinha = {
  rotulo: string;
  quantidade: number;
  receita?: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchesName(actual: string, wanted?: string) {
  if (!wanted) return true;
  return normalize(actual).includes(normalize(wanted));
}

function monthKey(value: Date | string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function inRange(value: Date | string, inicio?: string, fim?: string) {
  const created = new Date(value);
  if (inicio && created < new Date(`${inicio}T00:00:00`)) return false;
  if (fim && created > new Date(`${fim}T23:59:59.999`)) return false;
  return true;
}

function dimensionValue(
  fact: ReferralFact,
  dim: AssistantConsulta["quebrarPor"][number],
): string {
  if (dim === "situacao") return fact.status;
  if (dim === "nucleo") return fact.nucleusName;
  if (dim === "clinica") return fact.clinicName;
  if (dim === "consultorio") return fact.officeName;
  if (dim === "mes") return monthKey(fact.createdAt);
  return "—";
}

export function filterReferralFacts(
  facts: ReferralFact[],
  consulta: AssistantConsulta,
  now = new Date(),
): ReferralFact[] {
  const filtros = consulta.filtros ?? {};
  const excludeBlocked =
    consulta.assunto === "financeiro" && filtros.incluirBloqueados !== true;

  return facts.filter((fact) => {
    if (excludeBlocked && fact.status === "Bloqueado") return false;
    if (filtros.situacao?.length && !filtros.situacao.includes(fact.status)) {
      return false;
    }
    if (filtros.soAtrasados && !isReferralOverdue(fact, now)) return false;
    if (!inRange(fact.createdAt, filtros.inicio, filtros.fim)) return false;
    if (!matchesName(fact.clinicName, filtros.clinica)) return false;
    if (!matchesName(fact.officeName, filtros.consultorio)) return false;
    if (!matchesName(fact.nucleusName, filtros.nucleo)) return false;
    return true;
  });
}

export function aggregateReferralFacts(
  facts: ReferralFact[],
  consulta: AssistantConsulta,
  now = new Date(),
): ConsultaLinha[] {
  const filtered = filterReferralFacts(facts, consulta, now);
  const withRevenue = consulta.medir.includes("receita");
  const breaks = consulta.quebrarPor.filter(
    (item) => item !== "papel" && item !== "tipo",
  );

  const buckets = new Map<string, ConsultaLinha>();

  for (const fact of filtered) {
    const rotulo =
      breaks.length === 0
        ? "total"
        : breaks.map((dim) => dimensionValue(fact, dim)).join(" · ");
    const current = buckets.get(rotulo) ?? {
      rotulo,
      quantidade: 0,
      ...(withRevenue ? { receita: 0 } : {}),
    };
    current.quantidade += 1;
    if (withRevenue) {
      current.receita = (current.receita ?? 0) + fact.nucleusPrice;
    }
    buckets.set(rotulo, current);
  }

  if (buckets.size === 0) {
    return [
      {
        rotulo: "total",
        quantidade: 0,
        ...(withRevenue ? { receita: 0 } : {}),
      },
    ];
  }

  return [...buckets.values()].sort((a, b) => b.quantidade - a.quantidade);
}

export function aggregateCadastros(
  snapshot: CadastroSnapshot,
  consulta: AssistantConsulta,
): ConsultaLinha[] {
  const breaks = consulta.quebrarPor;

  if (breaks.includes("papel")) {
    return [
      {
        rotulo: "administrativo",
        quantidade: snapshot.usuariosPorPapel.administrativo,
      },
      { rotulo: "medico", quantidade: snapshot.usuariosPorPapel.medico },
      {
        rotulo: "profissional",
        quantidade: snapshot.usuariosPorPapel.profissional,
      },
    ];
  }

  if (breaks.includes("tipo")) {
    return [
      { rotulo: "clinica", quantidade: snapshot.clinicas },
      { rotulo: "consultorio", quantidade: snapshot.consultorios },
    ];
  }

  return [
    { rotulo: "clinicas", quantidade: snapshot.clinicas },
    { rotulo: "consultorios", quantidade: snapshot.consultorios },
    { rotulo: "nucleos", quantidade: snapshot.nucleos },
    { rotulo: "convenios", quantidade: snapshot.convenios },
    { rotulo: "servicos", quantidade: snapshot.servicos },
    { rotulo: "cirurgias", quantidade: snapshot.cirurgias },
    {
      rotulo: "usuarios",
      quantidade:
        snapshot.usuariosPorPapel.administrativo +
        snapshot.usuariosPorPapel.medico +
        snapshot.usuariosPorPapel.profissional,
    },
  ];
}

export function extractConsultaFromText(
  text: string,
): AssistantConsulta | null {
  const trimmed = text.trim();
  const candidates: string[] = [];

  if (trimmed.startsWith("{")) {
    candidates.push(trimmed);
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    candidates.push(fenced[1].trim());
  }

  const embedded = trimmed.match(/\{[\s\S]*"consulta"[\s\S]*\}/);
  if (embedded?.[0]) {
    candidates.push(embedded[0]);
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as { consulta?: unknown };
      const body = parsed.consulta ?? parsed;
      const result = assistantConsultaSchema.safeParse(body);
      if (result.success) {
        return result.data;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function money(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en-US" ? "en-US" : "pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatConsultaResultForModel(
  linhas: ConsultaLinha[],
  incompleto: boolean,
  locale: string,
): string {
  const body = linhas
    .map((linha) => {
      const receita =
        linha.receita === undefined ? "" : ` · ${money(linha.receita, locale)}`;
      return `- ${linha.rotulo}: ${linha.quantidade}${receita}`;
    })
    .join("\n");

  return [
    "Resultado da consulta (use estes números; não invente; não liste pacientes):",
    body || "- nenhum registro no recorte",
    incompleto
      ? "Há mais linhas do que o limite; descreva o recorte e sugira a tela se precisar do detalhe."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function loadConsultaData() {
  return withPrismaRetry(() =>
    prisma.$transaction([
      prisma.referral.findMany({
        select: {
          status: true,
          appointmentDate: true,
          createdAt: true,
          clinic: { select: { name: true } },
          office: { select: { name: true } },
          nucleus: { select: { name: true, chargedPrice: true } },
        },
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
      prisma.careNucleus.count(),
      prisma.agreement.count(),
      prisma.careService.count(),
      prisma.surgery.count(),
    ]),
  );
}

export async function runAssistantConsulta(consulta: AssistantConsulta) {
  const [
    referrals,
    orgByType,
    usersByRole,
    nucleos,
    convenios,
    servicos,
    cirurgias,
  ] = await loadConsultaData();

  if (consulta.assunto === "cadastros") {
    const papel = {
      administrativo: 0,
      medico: 0,
      profissional: 0,
    };
    for (const row of usersByRole) {
      if (row.role === "ADMINISTRATIVO") papel.administrativo = row._count._all;
      if (row.role === "MEDICO") papel.medico = row._count._all;
      if (row.role === "PROFISSIONAL") papel.profissional = row._count._all;
    }

    const linhas = aggregateCadastros(
      {
        clinicas:
          orgByType.find((row) => row.type === "CLINICA")?._count._all ?? 0,
        consultorios:
          orgByType.find((row) => row.type === "PROFISSIONAL_GROUP")?._count
            ._all ?? 0,
        nucleos,
        convenios,
        servicos,
        cirurgias,
        usuariosPorPapel: papel,
      },
      consulta,
    );

    return { linhas, incompleto: false };
  }

  const facts: ReferralFact[] = referrals.map((item) => ({
    status: item.status,
    appointmentDate: item.appointmentDate,
    createdAt: item.createdAt,
    clinicName: item.clinic.name,
    officeName: item.office.name,
    nucleusName: item.nucleus.name,
    nucleusPrice: Number(item.nucleus.chargedPrice),
  }));

  const linhas = aggregateReferralFacts(facts, consulta);
  return {
    linhas: linhas.slice(0, MAX_ROWS),
    incompleto: linhas.length > MAX_ROWS,
  };
}
