"use client";

import { useProfissionalPageModel } from "./hooks";
import { ProfissionalPageView } from "./view";

export default function ProfissionalPage() {
  const model = useProfissionalPageModel();

  return <ProfissionalPageView model={model} />;
}
