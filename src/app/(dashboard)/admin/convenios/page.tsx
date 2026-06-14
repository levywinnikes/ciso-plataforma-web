"use client";

import { useAgreementsManagement } from "./hooks";
import { AgreementsView } from "./view";

export default function AdminAgreementsPage() {
  const model = useAgreementsManagement();

  return <AgreementsView model={model} />;
}
