'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Modal } from '@/components/ui'
import { PROTOCOLS, Protocol, ProtocolService } from '@/data/mocks'
import { Plus, Trash2, Edit2, Settings, ListPlus, Calculator } from 'lucide-react'

// Extra mock data to populate the "Available Exams"
const MOCK_EXAMS: ProtocolService[] = [
  ...Array.from(new Set(PROTOCOLS.flatMap(p => p.services).map(s => JSON.stringify(s))))
].map(s => JSON.parse(s))

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'nucleos' | 'exames'>('nucleos')
  const [protocols, setProtocols] = useState<Protocol[]>(PROTOCOLS)
  const [exams, setExams] = useState<ProtocolService[]>(MOCK_EXAMS)
  
  // Modal states
  const [isNucleoModalOpen, setIsNucleoModalOpen] = useState(false)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  
  // New Nucleo form state
  const [newNucleoName, setNewNucleoName] = useState('')
  const [newNucleoPrice, setNewNucleoPrice] = useState<number | ''>('')
  const [selectedExamsForNucleo, setSelectedExamsForNucleo] = useState<ProtocolService[]>([])

  // New Exam form state
  const [newExamName, setNewExamName] = useState('')
  const [newExamPrice, setNewExamPrice] = useState<number | ''>('')

  const totalNormalValue = selectedExamsForNucleo.reduce((acc, curr) => acc + curr.price, 0)

  const handleCreateNucleo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNucleoName || newNucleoPrice === '' || selectedExamsForNucleo.length === 0) return

    const novoNucleo: Protocol = {
      id: `nucleo-${Date.now()}`,
      name: newNucleoName,
      chargedPrice: Number(newNucleoPrice),
      services: [...selectedExamsForNucleo]
    }

    setProtocols([...protocols, novoNucleo])
    setIsNucleoModalOpen(false)
    // reset form
    setNewNucleoName('')
    setNewNucleoPrice('')
    setSelectedExamsForNucleo([])
  }

  const addExamToNucleo = (exam: ProtocolService) => {
    setSelectedExamsForNucleo([...selectedExamsForNucleo, exam])
  }
  
  const removeExamFromNucleo = (index: number) => {
    const updated = [...selectedExamsForNucleo]
    updated.splice(index, 1)
    setSelectedExamsForNucleo(updated)
  }

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamName || newExamPrice === '') return

    const novoExame: ProtocolService = {
      name: newExamName,
      price: Number(newExamPrice)
    }

    setExams([...exams, novoExame])
    setIsExamModalOpen(false)
    setNewExamName('')
    setNewExamPrice('')
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Settings className="mr-3 h-6 w-6" /> 
          Cadastro de Núcleos
        </h1>
        <p className="text-gray-500 mt-1">Gerencie os catálogos de exames e configure os pacotes dos Núcleos de Atendimento.</p>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('nucleos')}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'nucleos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Gestão de Núcleos (Protocolos)
        </button>
        <button
          onClick={() => setActiveTab('exames')}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'exames' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Catálogo de Exames Base
        </button>
      </div>

      {activeTab === 'nucleos' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Núcleos Cadastrados</h2>
            <Button variant="primary" onClick={() => setIsNucleoModalOpen(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Novo Núcleo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {protocols.map(protocol => (
              <Card key={protocol.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-gray-100 flex-1">
                  <h3 className="font-bold text-primary mb-3 leading-tight">{protocol.name}</h3>
                  <div className="space-y-2 mb-4">
                    {protocol.services.map((s, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate pr-2">- {s.name}</span>
                        <span className="text-gray-400">R$ {s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-xl flex justify-between items-end">
                  <div>
                    {protocol.services.reduce((a, b) => a + b.price, 0) > protocol.chargedPrice && (
                      <p className="text-xs text-gray-500 mb-1">
                        Valor Normal: <span className="line-through">R$ {protocol.services.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                      </p>
                    )}
                    <p className="text-sm font-bold text-green-700">
                      {protocol.services.reduce((a, b) => a + b.price, 0) > protocol.chargedPrice ? 'Pacote:' : 'Valor:'} R$ {protocol.chargedPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-primary">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'exames' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Catálogo de Exames e Serviços</h2>
            <Button variant="outline" onClick={() => setIsExamModalOpen(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Exame
            </Button>
          </div>
          
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-4">Nome do Exame/Serviço</th>
                  <th className="px-6 py-4 text-right">Valor Avulso (Normal)</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {exams.map((exam, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{exam.name}</td>
                    <td className="px-6 py-4 text-right">R$ {exam.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400"><Edit2 className="h-4 w-4" /></Button>
                       <Button variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* MODAL: NOVO NÚCLEO */}
      <Modal
        isOpen={isNucleoModalOpen}
        onClose={() => setIsNucleoModalOpen(false)}
        title="Configurar Novo Núcleo de Atendimento"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateNucleo} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Nome do Núcleo / Pacote</label>
            <Input 
              required 
              placeholder="Ex: CONSULTA PROTOCOLO com EXAMES" 
              value={newNucleoName}
              onChange={e => setNewNucleoName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
            
            {/* Lado Esquerdo: Exames Disponíveis */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <ListPlus className="mr-2 h-4 w-4" /> Catálogo de Exames
              </h4>
              <div className="h-64 overflow-y-auto border rounded-md p-2 space-y-1 bg-gray-50">
                {exams.map((exam, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-white rounded border shadow-sm hover:border-primary cursor-pointer transition-colors" onClick={() => addExamToNucleo(exam)}>
                    <span className="text-xs font-medium text-gray-700">{exam.name}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">R$ {exam.price}</span>
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lado Direito: Exames Adicionados e Cálculos */}
            <div className="space-y-3 flex flex-col h-full">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <Settings className="mr-2 h-4 w-4" /> Composição do Núcleo
              </h4>
              
              <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-1 bg-white">
                {selectedExamsForNucleo.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 text-center p-4">
                    Clique nos exames ao lado para adicioná-colos na ordem desejada.
                  </div>
                ) : (
                  selectedExamsForNucleo.map((exam, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-primary/5 rounded border border-primary/20">
                      <div className="flex items-center truncate">
                        <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-[10px] text-primary font-bold mr-2 border shrink-0">{i + 1}</span>
                        <span className="text-xs font-medium text-primary truncate pr-2">{exam.name}</span>
                      </div>
                      <div className="flex items-center shrink-0">
                        <span className="text-xs font-semibold mr-2">R$ {exam.price}</span>
                        <button type="button" onClick={() => removeExamFromNucleo(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Soma (Valor Normal):</span>
                  <span className="font-semibold line-through text-gray-500">R$ {totalNormalValue.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-900 flex items-center">
                    <Calculator className="mr-2 h-4 w-4 text-green-600" /> Valor Cobrado (Pacote)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <Input 
                      required
                      type="number" 
                      step="0.01"
                      className="pl-10 font-bold text-green-700 border-green-200 focus:ring-green-500"
                      placeholder="0.00"
                      value={newNucleoPrice}
                      onChange={e => setNewNucleoPrice(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  {newNucleoPrice !== '' && Number(newNucleoPrice) < totalNormalValue && (
                    <p className="text-xs font-medium text-green-600 text-right mt-1">
                      Desconto de R$ {(totalNormalValue - Number(newNucleoPrice)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsNucleoModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Criar Núcleo</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: NOVO EXAME */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Cadastrar Novo Exame ou Serviço"
      >
        <form onSubmit={handleCreateExam} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Nome do Exame/Serviço</label>
            <Input 
              required 
              placeholder="Ex: Paquimetria Ultrassônica" 
              value={newExamName}
              onChange={e => setNewExamName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Valor Avulso Normal (R$)</label>
            <Input 
              required 
              type="number"
              step="0.01"
              placeholder="Ex: 150.00" 
              value={newExamPrice}
              onChange={e => setNewExamPrice(e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsExamModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Adicionar Exame</Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
