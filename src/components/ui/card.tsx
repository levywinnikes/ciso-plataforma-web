import type { ReactNode } from "react";

import { cn } from "./utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
