import type { ReactNode } from "react";

import { Card } from "./card";
import { cn } from "./utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

export function StatCard({ label, value, valueClassName }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={cn("text-2xl font-bold text-gray-900", valueClassName)}>
        {value}
      </p>
    </Card>
  );
}
