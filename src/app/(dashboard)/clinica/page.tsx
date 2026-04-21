"use client";

import { useClinicaPageModel } from "./hooks";
import { ClinicaPageView } from "./view";

export default function ClinicaPage() {
  const model = useClinicaPageModel();

  return <ClinicaPageView model={model} />;
}
