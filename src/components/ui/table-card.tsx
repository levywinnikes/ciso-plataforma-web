import type { ReactNode } from "react";

import { Card } from "./card";
import { cn } from "./utils";

interface TableCardProps {
  title: string;
  headerClassName?: string;
  children: ReactNode;
}

export function TableCard({
  title,
  headerClassName,
  children,
}: TableCardProps) {
  return (
    <Card className="p-0">
      <div className={cn("border-b px-6 py-4 text-gray-900", headerClassName)}>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}
