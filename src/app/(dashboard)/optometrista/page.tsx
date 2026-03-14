'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, Button, Modal, Textarea } from '@/components/ui'
import { MOCK_REFERRALS, Referral } from '@/data/mocks'
import { PlusCircle, Clock, CheckCircle2, History } from 'lucide-react'

export default function OptometristaPage() {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const stats = [
    { label: 'Total Encaminhados', value: MOCK_REFERRALS.length, icon: PlusCircle, color: 'text-blue-600' },
    { label: 'Aguardando Triagem', value: MOCK_REFERRALS.filter(r => r.status === 'Aguardando Triagem').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Atendimentos Finalizados', value: MOCK_REFERRALS.filter(r => r.status === 'Finalizado').length, icon: CheckCircle2, color: 'text-green-600' },
  ]

  const handleOpenResult = (referral: Referral) => {
    setSelectedReferral(referral)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Painel do Optometrista</h1>
          <p className="text-gray-500">Gerencie seus encaminhamentos e acompanhe o status dos pacientes.</p>
        </div>
        <Link href="/optometrista/novo">
          <Button variant="primary" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Encaminhamento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-10 w-10 ${stat.color} opacity-20`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">Meus Encaminhamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Suspeita</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {MOCK_REFERRALS.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{referral.patientName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs">{referral.date}</td>
                  <td className="whitespace-nowrap px-6 py-4">{referral.suspect}</td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                      referral.status === 'Finalizado' ? 'bg-green-100 text-green-800' :
                      referral.status === 'Agendado' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      className="text-primary hover:text-accent text-xs"
                      onClick={() => referral.status === 'Finalizado' && handleOpenResult(referral)}
                    >
                      {referral.status === 'Finalizado' ? 'Ver Resultado' : 'Ver Detalhes'}
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
        title="Resultado do Encaminhamento"
        footer={<Button variant="primary" onClick={() => setIsModalOpen(false)}>Fechar</Button>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 border border-green-100">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Núcleo de Atendimento</p>
              <p className="font-semibold text-primary">{selectedReferral?.nucleus}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Data do Atendimento</p>
              <p className="font-semibold text-primary">{selectedReferral?.appointmentDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <History className="mr-2 h-4 w-4 text-primary" />
              Laudo do Médico Especialista
            </label>
            <div className="rounded-lg border bg-white p-4 text-sm text-gray-700 leading-relaxed shadow-sm">
              {selectedReferral?.report || "Paciente avaliado no núcleo especializado. Confirmada a necessidade de acompanhamento periódico. Iniciado protocolo terapêutico conforme diretrizes clínicas e retorno em 60 dias para reavaliação."}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
