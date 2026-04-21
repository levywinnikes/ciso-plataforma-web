import type { ReactNode } from "react";

import { Card } from "./card";
import { cn } from "./utils";

interface CardSectionProps {
  title: string;
  titleClassName?: string;
  className?: string;
  children: ReactNode;
}

export function CardSection({
  title,
  titleClassName,
  className,
  children,
}: CardSectionProps) {
  return (
    <Card className={cn("p-6", className)}>
      <h2
        className={cn("mb-4 text-lg font-bold text-gray-900", titleClassName)}
      >
        {title}
      </h2>
      {children}
    </Card>
  );
}
