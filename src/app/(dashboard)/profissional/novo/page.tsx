"use client";

import { useNovoEncaminhamentoPageModel } from "./hooks";
import { NovoEncaminhamentoPageView } from "./view";

export default function NovoEncaminhamentoPage() {
  const model = useNovoEncaminhamentoPageModel();

  return <NovoEncaminhamentoPageView model={model} />;
}
