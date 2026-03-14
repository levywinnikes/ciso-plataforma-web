'use client'

import { Card, Button, Input } from '@/components/ui'
import { CLINICAL_SUSPECTS } from '@/data/mocks'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NovoEncaminhamentoPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/optometrista">
          <Button variant="ghost" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-primary">Novo Encaminhamento</h1>
      </div>

      <Card className="p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome do Paciente</label>
              <Input placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Idade</label>
                <Input type="number" placeholder="Ex: 45" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CPF</label>
                <Input placeholder="000.000.000-00" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Suspeita Clínica (Sinais de Alerta)</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="">Selecione uma opção</option>
              {CLINICAL_SUSPECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Observações Clínicas</label>
            <textarea 
              className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Descreva os achados clínicos..."
            />
          </div>

          <div className="flex justify-end space-x-4 border-t pt-6">
            <Link href="/optometrista">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button variant="primary" className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Enviar Encaminhamento
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
