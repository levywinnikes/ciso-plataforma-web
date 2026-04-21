"use client";

import { useFinanceiroPageModel } from "./hooks";
import { FinanceiroPageView } from "./view";

export default function FinanceiroPage() {
  const model = useFinanceiroPageModel();

  return <FinanceiroPageView model={model} />;
}
