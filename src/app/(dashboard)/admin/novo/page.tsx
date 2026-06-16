"use client";

import { useAdminNovoEncaminhamentoPageModel } from "./hooks";
import { AdminNovoEncaminhamentoPageView } from "./view";

export default function AdminNovoEncaminhamentoPage() {
  const model = useAdminNovoEncaminhamentoPageModel();

  return <AdminNovoEncaminhamentoPageView model={model} />;
}
