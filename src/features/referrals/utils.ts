import type { CareNucleus } from "./types";

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(input: string): string {
  return new Date(input).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatDateTime(input: string): string {
  return new Date(input).toLocaleString("pt-BR");
}

export function getNucleusPriceSummary(nucleus: CareNucleus) {
  const fullPrice = nucleus.services.reduce(
    (sum, service) => sum + service.basePrice,
    0,
  );
  const discount = Math.max(fullPrice - nucleus.chargedPrice, 0);

  return {
    fullPrice,
    discount,
    chargedPrice: nucleus.chargedPrice,
  };
}
