'use client'

import React, { useState } from 'react'
import { Card, Button, Modal, Textarea } from '@/components/ui'
import { MOCK_REFERRALS, Referral } from '@/data/mocks'
import { CheckCircle2, Clipboard } from 'lucide-react'

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

  return (
    <div className="relative space-y-8">
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-[60] flex items-center bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Atendimento finalizado e laudo enviado!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-primary">Painel do Médico Especialista</h1>
        <p className="text-gray-500">Visualize sua agenda do dia e emita laudos para os pacientes.</p>
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
                  <th className="px-6 py-3">Núcleo</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">10:00</td>
                    <td className="whitespace-nowrap px-6 py-4">{item.patientName}</td>
                    <td className="whitespace-nowrap px-6 py-4">{item.nucleus}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Button 
                        variant="primary" 
                        className="text-xs"
                        onClick={() => handleOpenAtendimento(item)}
                      >
                        Realizar Atendimento
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Resumo de Produtividade</h3>
        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <div className="text-center min-w-[80px]">
            <p className="text-sm text-gray-500">Atendidos</p>
            <p className="text-2xl font-bold text-green-600">8</p>
          </div>
          <div className="hidden md:block h-10 w-px bg-gray-200" />
          <div className="text-center min-w-[80px]">
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">4</p>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Atendimento Clínico"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleFinish}>Finalizar e Enviar Laudo</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Informações do Encaminhamento</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Paciente</p>
                <p className="text-sm font-semibold">{selectedReferral?.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Suspeita Clínica</p>
                <p className="text-sm font-semibold">{selectedReferral?.suspect}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Observações do Optometrista</p>
              <p className="text-sm italic text-gray-700">"{selectedReferral?.observations}"</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Laudo / Retorno Médico (Devolutiva)</label>
            <Textarea 
              placeholder="Digite aqui as conclusões clínicas e orientações para o optometrista..."
              className="min-h-[150px]"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
