"use client";

import { useMedicoPageModel } from "./hooks";
import { MedicoPageView } from "./view";

export default function MedicoPage() {
  const model = useMedicoPageModel();

  return <MedicoPageView model={model} />;
}
