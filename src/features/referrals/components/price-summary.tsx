import { formatCurrency } from "../utils";

interface PriceSummaryProps {
  fullPrice: number;
  discount: number;
  chargedPrice: number;
  /** 'card' = green box wrapper (default); 'inline' = borderless rows only */
  variant?: "card" | "inline";
}

export function PriceSummary({
  fullPrice,
  discount,
  chargedPrice,
  variant = "card",
}: PriceSummaryProps) {
  const rows = (
    <>
      <p className="flex items-center justify-between">
        <span>Valor bruto</span>
        <span>{formatCurrency(fullPrice)}</span>
      </p>
      <p className="mt-1 flex items-center justify-between font-semibold text-green-700">
        <span>Desconto</span>
        <span>{formatCurrency(discount)}</span>
      </p>
      <p className="mt-1 flex items-center justify-between font-bold text-primary">
        <span>Valor final</span>
        <span>{formatCurrency(chargedPrice)}</span>
      </p>
    </>
  );

  if (variant === "inline") {
    return <div className="text-sm">{rows}</div>;
  }

  return (
    <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm">
      {rows}
    </div>
  );
}
