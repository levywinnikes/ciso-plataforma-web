"use client";

import { useServicesManagement } from "./hooks";
import { ServicesView } from "./view";

export default function AdminServicesPage() {
  const model = useServicesManagement();

  return <ServicesView model={model} />;
}
