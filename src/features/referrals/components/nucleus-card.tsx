import { Card } from "@/components/ui";

import type { CareNucleus } from "../types";
import { formatCurrency, getNucleusPriceSummary } from "../utils";
import { PriceSummary } from "./price-summary";

export function NucleusCard({ nucleus }: { nucleus: CareNucleus }) {
  const summary = getNucleusPriceSummary(nucleus);

  return (
    <Card className="p-5">
      <h2 className="text-base font-bold text-primary">{nucleus.name}</h2>
      <p className="mt-1 text-sm text-gray-500">{nucleus.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {nucleus.services.map((service) => (
          <li
            key={service.id}
            className="flex items-center justify-between gap-4"
          >
            <span>{service.name}</span>
            <span>{formatCurrency(service.basePrice)}</span>
          </li>
        ))}
      </ul>
      <PriceSummary {...summary} />
    </Card>
  );
}
