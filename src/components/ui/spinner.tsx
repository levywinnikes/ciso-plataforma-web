import type { LucideProps } from "lucide-react";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

export function Spinner({ className, ...props }: LucideProps) {
  return (
    <Loader2
      className={cn("animate-spin text-current", className)}
      {...props}
    />
  );
}
