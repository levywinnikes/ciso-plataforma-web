import { ReactNode } from "react";

import { Card } from "@/components/ui";

import type { CareNucleus } from "../types";
import { formatCurrency, getNucleusPriceSummary } from "../utils";
import { PriceSummary } from "./price-summary";

export function NucleusCard({
  nucleus,
  actions,
}: {
  nucleus: CareNucleus;
  actions?: ReactNode;
}) {
  const summary = getNucleusPriceSummary(nucleus);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-primary">{nucleus.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{nucleus.description}</p>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
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
