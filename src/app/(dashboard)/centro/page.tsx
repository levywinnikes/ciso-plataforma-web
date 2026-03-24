'use client'

import React, { useState } from 'react'
import { Card, Button, Modal, Input } from '@/components/ui'
import { MOCK_REFERRALS, SPECIALTY_NUCLEI, Referral } from '@/data/mocks'
import { Filter, Calendar, Users, CheckCircle2 } from 'lucide-react'

export default function CentroPage() {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const pendingReferrals = MOCK_REFERRALS.filter(r => r.status === 'Encaminhado')

  const handleOpenTriage = (referral: Referral) => {
    setSelectedReferral(referral)
    setIsModalOpen(true)
  }

  const handleConfirm = () => {
    setIsModalOpen(false)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  return (
    <div className="relative space-y-8">
      {showSuccessToast && (
        <div className="fixed top-24 right-8 z-[60] flex items-center bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Agendamento confirmado com sucesso!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-primary">Painel do Centro (Triagem)</h1>
        <p className="text-gray-500">Realize a triagem técnica e agende os pacientes nos núcleos especializados.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pendentes de Triagem</p>
              <p className="text-3xl font-bold text-gray-900">{pendingReferrals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Agendados para Hoje</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">Encaminhamentos Recebidos</h3>
          <Button variant="outline" className="text-xs">
            <Filter className="mr-2 h-3 w-3" />
            Filtrar
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Data Envio</th>
                <th className="px-6 py-3">Protocolo Solicitado</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pendingReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{referral.patientName}</td>
                  <td className="whitespace-nowrap px-6 py-4">{referral.date}</td>
                  <td className="whitespace-nowrap px-6 py-4 truncate max-w-[250px]" title={referral.protocolName}>{referral.protocolName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Button 
                      variant="primary" 
                      className="text-xs"
                      onClick={() => handleOpenTriage(referral)}
                    >
                      Fazer Triagem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Triagem do Paciente"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirm}>Confirmar Agendamento</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Paciente</p>
              <p className="font-semibold text-primary">{selectedReferral?.patientName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Protocolo Selecionado</p>
              <p className="font-semibold text-primary">{selectedReferral?.protocolName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Médico Responsável</label>
              <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">Selecione o médico para o atendimento</option>
                <option value="dr-fernando">Dr. Fernando Silva (Glaucoma, Catarata)</option>
                <option value="dra-aline">Dra. Aline Mendes (Retina, Refrativa)</option>
                <option value="dr-roberto">Dr. Roberto Carlos (Córnea, Superfície Ocular)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data do Agendamento</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Horário</label>
                <Input type="time" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
