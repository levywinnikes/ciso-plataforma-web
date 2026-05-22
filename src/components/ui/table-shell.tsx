import type { ReactNode } from "react";

import { cn } from "./utils";

interface TableShellProps {
  columns: ReactNode;
  children: ReactNode;
  tableClassName?: string;
  headClassName?: string;
  bodyClassName?: string;
}

export function TableShell({
  columns,
  children,
  tableClassName,
  headClassName,
  bodyClassName,
}: TableShellProps) {
  return (
    <table className={cn("ui-table", tableClassName)}>
      <thead className={cn("ui-table-head", headClassName)}>{columns}</thead>
      <tbody className={cn("divide-y divide-gray-200 bg-white", bodyClassName)}>
        {children}
      </tbody>
    </table>
  );
}
