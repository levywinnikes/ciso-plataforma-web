"use client";

import { useAdminPageModel } from "./hooks";
import { AdminPageView } from "./view";

export default function AdminPage() {
  const model = useAdminPageModel();

  return <AdminPageView model={model} />;
}
