"use client";

import { useSurgeriesManagement } from "./hooks";
import { SurgeriesView } from "./view";

export default function AdminSurgeriesPage() {
  const model = useSurgeriesManagement();

  return <SurgeriesView model={model} />;
}
