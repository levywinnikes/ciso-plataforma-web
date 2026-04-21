import { ClipboardList } from "lucide-react";

import type { Referral } from "../types";

export function PatientRecord({ referral }: { referral: Referral }) {
  return (
    <div className="ui-record-panel">
      <div className="ui-record-panel-header">
        <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-primary">
          <ClipboardList className="mr-2 h-4 w-4" />
          Prontuário de Triagem
        </h4>
        <span className="text-xs font-semibold text-gray-500">
          Data: {referral.createdAt}
        </span>
      </div>

      <div className="space-y-6 p-5">
        <div>
          <h5 className="ui-record-section-title">
            1. Identificação do Paciente
          </h5>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2">
              <span className="mb-1 block text-xs text-gray-500">
                Nome Completo
              </span>
              <span className="font-bold text-gray-900">
                {referral.patientName}
              </span>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500">
                Nascimento
              </span>
              <span className="font-semibold text-gray-900">
                {referral.patientBirthDate || "Não inf."}
              </span>
            </div>
            <div>
              <span className="mb-1 block text-xs text-gray-500">Telefone</span>
              <span className="font-semibold text-gray-900">
                {referral.patientPhone || "Não inf."}
              </span>
            </div>
          </div>
          {referral.patientDocument && (
            <div className="mt-3">
              <span className="mb-1 block text-xs text-gray-500">
                Documento
              </span>
              <span className="font-semibold text-gray-900">
                {referral.patientDocument}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h5 className="ui-record-section-title">2. Histórico Clínico</h5>
          <div className="space-y-4">
            {referral.systemicDiseases && (
              <div className="rounded-md border border-orange-100 bg-orange-50/50 p-3">
                <span className="mb-1 block text-xs font-bold text-orange-800">
                  ⚠️ Doenças Sistêmicas Relatadas
                </span>
                <span className="text-sm text-gray-800">
                  {referral.systemicDiseases}
                </span>
              </div>
            )}
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <span className="mb-1 block text-xs font-bold text-gray-500">
                Queixa Principal / Observações
              </span>
              <span className="text-sm italic text-gray-800">
                &ldquo;{referral.clinicalNotes}&rdquo;
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h5 className="ui-record-section-title">3. Protocolo Solicitado</h5>
          <div>
            <span className="mb-1 block text-xs text-gray-500">
              Núcleo Base
            </span>
            <span className="font-bold text-primary">
              {referral.nucleusName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
