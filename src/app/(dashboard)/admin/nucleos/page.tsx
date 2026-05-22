"use client";

import { useAdminPageModel } from "../hooks";
import { AdminPageView } from "../view";

export default function NucleiManagementPage() {
  const model = useAdminPageModel();

  return <AdminPageView model={model} />;
}
