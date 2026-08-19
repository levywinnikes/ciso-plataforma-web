import {
  aggregateCadastros,
  aggregateReferralFacts,
  extractConsultaFromText,
} from "../consulta-engine";
import { assistantConsultaSchema } from "../consulta-schema";

const facts = [
  {
    status: "Agendado" as const,
    appointmentDate: new Date(2026, 7, 18),
    createdAt: new Date(2026, 7, 1),
    clinicName: "Visão Centro",
    officeName: "Consultório Alfa",
    nucleusName: "Retina",
    nucleusPrice: 100,
  },
  {
    status: "Atendido" as const,
    appointmentDate: new Date(2026, 6, 1),
    createdAt: new Date(2026, 7, 10),
    clinicName: "Visão Centro",
    officeName: "Consultório Beta",
    nucleusName: "Catarata",
    nucleusPrice: 50,
  },
  {
    status: "Bloqueado" as const,
    appointmentDate: null,
    createdAt: new Date(2026, 7, 10),
    clinicName: "Outra Clínica",
    officeName: "Consultório Alfa",
    nucleusName: "Retina",
    nucleusPrice: 100,
  },
];

describe("aggregateReferralFacts", () => {
  it("breaks by situation without predicting a single report", () => {
    const consulta = assistantConsultaSchema.parse({
      assunto: "encaminhamentos",
      medir: ["quantidade"],
      quebrarPor: ["situacao"],
    });
    const rows = aggregateReferralFacts(facts, consulta, new Date(2026, 7, 19));
    const byLabel = Object.fromEntries(
      rows.map((row) => [row.rotulo, row.quantidade]),
    );
    expect(byLabel.Agendado).toBe(1);
    expect(byLabel.Atendido).toBe(1);
    expect(byLabel.Bloqueado).toBe(1);
  });

  it("filters overdue and clinic name together", () => {
    const consulta = assistantConsultaSchema.parse({
      assunto: "encaminhamentos",
      medir: ["quantidade"],
      filtros: { soAtrasados: true, clinica: "visão" },
    });
    const rows = aggregateReferralFacts(facts, consulta, new Date(2026, 7, 19));
    expect(rows[0]?.quantidade).toBe(1);
  });

  it("excludes blocked from finance unless asked", () => {
    const consulta = assistantConsultaSchema.parse({
      assunto: "financeiro",
      medir: ["quantidade", "receita"],
      quebrarPor: ["nucleo"],
    });
    const rows = aggregateReferralFacts(facts, consulta);
    expect(rows.find((row) => row.rotulo === "Retina")?.quantidade).toBe(1);
    expect(rows.find((row) => row.rotulo === "Retina")?.receita).toBe(100);
  });
});

describe("aggregateCadastros", () => {
  it("can break users by role", () => {
    const consulta = assistantConsultaSchema.parse({
      assunto: "cadastros",
      quebrarPor: ["papel"],
    });
    const rows = aggregateCadastros(
      {
        clinicas: 2,
        consultorios: 3,
        nucleos: 4,
        convenios: 1,
        servicos: 5,
        cirurgias: 2,
        usuariosPorPapel: { administrativo: 1, medico: 4, profissional: 8 },
      },
      consulta,
    );
    expect(rows.find((row) => row.rotulo === "medico")?.quantidade).toBe(4);
  });
});

describe("extractConsultaFromText", () => {
  it("reads a consulta json from the model", () => {
    const parsed = extractConsultaFromText(
      '{"consulta":{"assunto":"encaminhamentos","medir":["quantidade"],"filtros":{"soAtrasados":true}}}',
    );
    expect(parsed?.assunto).toBe("encaminhamentos");
    expect(parsed?.filtros.soAtrasados).toBe(true);
  });
});
