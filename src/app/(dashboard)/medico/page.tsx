'use client'

import React, { useState } from 'react'
import { Card, Button, Modal, Textarea } from '@/components/ui'
import { MOCK_REFERRALS, Referral, PROTOCOLS } from '@/data/mocks'
import { CheckCircle2, FileText, Upload, Edit, ClipboardList } from 'lucide-react'

export default function MedicoPage() {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const items = MOCK_REFERRALS.filter(r => r.status === 'Agendado')

  const handleOpenAtendimento = (referral: Referral) => {
    setSelectedReferral(referral)
    setIsModalOpen(true)
  }

  const handleFinish = () => {
    setIsModalOpen(false)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const activeProtocol = PROTOCOLS.find(p => p.id === selectedReferral?.protocolId)

  return (
    <div className="relative space-y-8">
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-[60] flex items-center bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Atendimento atualizado e finalizado com sucesso!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-primary">Painel do Médico Especialista</h1>
        <p className="text-gray-500">Visualize sua agenda do dia, analise as triagens e emita condutas.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-0">
          <div className="border-b px-6 py-4 bg-primary text-white">
            <h3 className="font-semibold">Minha Agenda - Hoje</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Horário</th>
                  <th className="px-6 py-3">Paciente</th>
                  <th className="px-6 py-3">Núcleo / Protocolo</th>
                  <th className="px-6 py-3">Médico Responsável</th>
                  <th className="px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOpenAtendimento(item)}
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">10:00</td>
                    <td className="whitespace-nowrap px-6 py-4">{item.patientName}</td>
                    <td className="whitespace-nowrap px-6 py-4 truncate max-w-[200px]" title={item.protocolName}>{item.protocolName}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-medium text-gray-700">{item.doctor || 'Não atribuído'}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        className="text-xs text-primary font-semibold hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAtendimento(item);
                        }}
                      >
                        Abrir Ficha
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Atendimento Especializado"
        maxWidth="max-w-4xl" // Make it wider so fields don't feel cramped with both views open
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleFinish} className="flex items-center bg-green-700 hover:bg-green-800">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar Conduta
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Ficha do Paciente Completa */}
          <div className="bg-white border rounded-xl text-left shadow-sm overflow-hidden text-sm ring-1 ring-gray-100">
             {/* Header */}
             <div className="bg-primary/5 px-5 py-3 border-b border-primary/10 flex justify-between items-center">
               <h4 className="flex items-center text-sm font-bold uppercase text-primary tracking-wider">
                 <ClipboardList className="mr-2 h-4 w-4" />
                 Prontuário de Triagem
               </h4>
               <span className="text-xs font-semibold text-gray-500">Data: {selectedReferral?.date}</span>
             </div>

             <div className="p-5 space-y-6">
                {/* Dados Pessoais */}
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Identificação do Paciente</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <span className="block text-xs text-gray-500 mb-1">Nome Completo</span>
                      <span className="font-bold text-gray-900">{selectedReferral?.patientName}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Nascimento</span>
                      <span className="font-semibold text-gray-900">{selectedReferral?.patientBirthDate || 'Não inf.'}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Telefone</span>
                      <span className="font-semibold text-gray-900">{selectedReferral?.patientPhone || 'Não inf.'}</span>
                    </div>
                  </div>
                  {selectedReferral?.patientDocument && (
                    <div className="mt-3">
                      <span className="block text-xs text-gray-500 mb-1">Documento</span>
                      <span className="font-semibold text-gray-900">{selectedReferral?.patientDocument}</span>
                    </div>
                  )}
                </div>

                {/* Info Clínicas */}
                <div className="border-t border-gray-100 pt-4">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">2. Histórico Clínico</h5>
                  <div className="space-y-4">
                    {selectedReferral?.systemicDiseases && (
                      <div className="bg-orange-50/50 p-3 rounded-md border border-orange-100">
                        <span className="block text-xs text-orange-800 font-bold mb-1">⚠️ Doenças Sistêmicas Relatadas</span>
                        <span className="text-gray-800 text-sm">{selectedReferral.systemicDiseases}</span>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                      <span className="block text-xs text-gray-500 font-bold mb-1">Queixa Principal / Observações</span>
                      <span className="text-gray-800 text-sm italic">"{selectedReferral?.observations}"</span>
                    </div>
                  </div>
                </div>

                {/* Protocolo */}
                <div className="border-t border-gray-100 pt-4">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">3. Protocolo Solicitado</h5>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Núcleo Base</span>
                    <span className="font-bold text-primary">{selectedReferral?.protocolName}</span>
                  </div>
                  {activeProtocol && (
                    <div className="mt-3">
                      <span className="block text-xs text-gray-500 mb-2">Exames Inclusos no Pacote:</span>
                      <div className="flex flex-wrap gap-2">
                        {activeProtocol.services.map((s, i) => (
                          <span key={i} className="bg-white border border-gray-200 text-gray-600 px-2 py-1.5 rounded text-xs shadow-sm font-medium">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Área de Edição e Laudo (Sempre Visível) */}
          <div className="space-y-5 bg-gray-50/50 p-5 rounded-xl border border-dashed border-gray-200">
            <h4 className="flex items-center text-sm font-bold uppercase text-primary tracking-wider mb-2">
              <FileText className="mr-2 h-4 w-4" />
              Laudo e Conduta Médica
            </h4>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Considerações Médicas / Parecer Técnico</label>
              <Textarea 
                placeholder="Descreva as análises dos exames, estado clínico, refração detalhada..."
                className="min-h-[120px] shadow-sm border-gray-300 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Conduta / Tratamento (Devolutiva)</label>
              <Textarea 
                placeholder="Ex: Prescrição de colírio X, cirurgia agendada, uso de óculos, etc..."
                className="min-h-[120px] shadow-sm border-gray-300 focus:border-primary"
              />
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">Anexar Exames Compl. / Receituário</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="h-5 w-5 text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-600">Adicionar PDFs ou Imagens</p>
              </div>
            </div>
          </div>

        </div>
      </Modal>
    </div>
  )
}
