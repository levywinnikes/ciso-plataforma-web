'use client'

import React, { useState } from 'react'
import { Card, Button, Input, Textarea, Modal } from '@/components/ui'
import { PROTOCOLS } from '@/data/mocks'
import { ArrowLeft, Save, Upload, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NovoEncaminhamentoPage() {
  const router = useRouter()
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('')
  
  // Form State
  const [patientName, setPatientName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [systemicDiseases, setSystemicDiseases] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const selectedProtocol = PROTOCOLS.find(p => p.id === selectedProtocolId)

  const normalTotal = selectedProtocol 
    ? selectedProtocol.services.reduce((acc, curr) => acc + curr.price, 0)
    : 0

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSubmit = () => {
    alert('Encaminhamento gerado com sucesso!')
    router.push('/optometrista')
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/optometrista">
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-primary">Novo Encaminhamento</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Lado Esquerdo - Dados e Clínicas */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 lg:p-8 shadow-sm border-gray-100 transition-shadow hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-5 flex items-center">
              <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span> 
              Dados do Paciente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Nome do Paciente <span className="text-red-500">*</span></label>
                <Input required placeholder="Nome completo" className="h-11 shadow-sm" value={patientName} onChange={e => setPatientName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Data de Nascimento <span className="text-red-500">*</span></label>
                <Input type="date" required className="h-11 shadow-sm" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Telefone <span className="text-red-500">*</span></label>
                <Input required placeholder="(00) 00000-0000" className="h-11 shadow-sm" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Documento <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <Input placeholder="CPF, RG ou Passaporte" className="md:w-1/2 h-11 shadow-sm" value={documentId} onChange={e => setDocumentId(e.target.value)} />
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:p-8 shadow-sm border-gray-100 transition-shadow hover:shadow-md">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-5 flex items-center">
              <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span> 
              Informações Clínicas
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Doenças Sistêmicas <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-sm resize-none"
                  placeholder="Ex: Diabetes, Hipertensão, asma..."
                  value={systemicDiseases}
                  onChange={e => setSystemicDiseases(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Observações Clínicas / Queixa Principal</label>
                <textarea 
                  className="flex min-h-[110px] w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-sm resize-none"
                  placeholder="Descreva os achados clínicos e sintomas relevantes do paciente..."
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:p-8 shadow-sm border-gray-100 transition-shadow hover:shadow-md">
             <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-5 flex items-center">
              <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span> 
              Documentos e Anexos
            </h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-primary/50 cursor-pointer transition-all group">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-gray-700">Clique para anexar ou arraste os arquivos</p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </Card>
        </div>

        {/* Lado Direito - Protocolo e Confirmação (Sticky se possível) */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
          <Card className="p-6 lg:p-8 shadow-md border-primary/20 overflow-hidden relative">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />

            <h3 className="text-lg font-bold text-primary border-b border-primary/10 pb-3 mb-5 flex items-center">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-sm">4</span> 
              Definição do Protocolo
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">PROTOCOLOS ESPECIALIZADOS - OFTALMOLOGIA <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-500 mb-2">Selecione o pacote de exames e serviços necessários.</p>
                <select 
                  required
                  value={selectedProtocolId}
                  onChange={(e) => setSelectedProtocolId(e.target.value)}
                  className="flex h-12 w-full rounded-md border-2 border-primary/20 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary transition-colors shadow-sm cursor-pointer"
                >
                  <option value="">Selecione um Núcleo</option>
                  {PROTOCOLS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProtocol && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Composição do Protocolo</h4>
                    <ul className="space-y-2 mb-6">
                      {selectedProtocol.services.map((service, index) => (
                        <li key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                          <div className="flex items-center text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                            {service.name}
                          </div>
                          <span className="font-medium text-gray-500">R$ {service.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="bg-primary/5 p-5 rounded-xl flex flex-col items-end space-y-1 relative overflow-hidden border border-primary/10">
                      {/* Efeito visual subtil */}
                      <div className="absolute -left-4 -top-4 w-12 h-12 bg-white/40 rounded-full blur-xl" />

                      {normalTotal > selectedProtocol.chargedPrice && (
                        <div className="text-sm text-gray-500 z-10 w-full flex justify-between items-center">
                          <span>Soma dos exames:</span>
                          <span className="line-through decoration-red-400 decoration-2 font-medium">R$ {normalTotal.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="text-xl font-black text-primary z-10 w-full flex justify-between items-end mt-2 pt-2 border-t border-primary/10">
                        <span className="text-sm font-bold uppercase tracking-wide">
                          {normalTotal > selectedProtocol.chargedPrice ? 'Valor Pacote' : 'Valor Total'}
                        </span>
                        <span>R$ {selectedProtocol.chargedPrice.toFixed(2)}</span>
                      </div>
                      
                      {normalTotal > selectedProtocol.chargedPrice && (
                        <div className="w-full mt-3">
                          <div className="inline-flex w-full items-center justify-between text-sm font-bold text-green-700 bg-green-100/80 px-4 py-2 rounded-lg border border-green-200">
                            <span>🔔 Economia gerada</span>
                            <span>R$ {(normalTotal - selectedProtocol.chargedPrice).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <Button type="button" variant="outline" className="text-gray-500 h-12 px-6" onClick={() => window.history.back()}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" disabled={!selectedProtocol}>
                Finalizar e Encaminhar
              </Button>
            </div>
          </Card>
        </div>
      </form>

      {/* MODAL DE CONFIRMAÇÃO */}
      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)}
        title="Revisar Dados do Encaminhamento" 
      >
        <div className="space-y-4 py-2">
          <div className="bg-white border rounded-xl text-left shadow-sm overflow-hidden text-sm ring-1 ring-gray-100">
             
             {/* Dados do Paciente */}
             <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100 font-bold text-gray-700 text-xs uppercase tracking-wider">
               1. Dados do Paciente
             </div>
             <div className="p-4 space-y-2 bg-white">
               <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                  <span className="text-gray-500 whitespace-nowrap mr-4">Nome:</span>
                  <span className="text-gray-900 font-bold text-right break-words">{patientName}</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Nascimento:</span>
                  <span className="text-gray-900 font-semibold">{birthDate && new Date(birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Telefone:</span>
                  <span className="text-gray-900 font-semibold">{phone}</span>
               </div>
               {documentId && (
                 <div className="flex justify-between items-center">
                    <span className="text-gray-500">Documento:</span>
                    <span className="text-gray-900 font-semibold">{documentId}</span>
                 </div>
               )}
             </div>

             {/* Informações Clínicas */}
             <div className="bg-gray-50/80 px-4 py-2 border-y border-gray-100 font-bold text-gray-700 text-xs uppercase tracking-wider">
               2. Informações Clínicas
             </div>
             <div className="p-4 space-y-3 bg-white">
               {systemicDiseases && (
                 <div className="flex flex-col border-b border-gray-50 pb-2 gap-1 text-xs">
                    <span className="text-gray-500 font-medium tracking-wide">Doenças Sistêmicas:</span>
                    <span className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">{systemicDiseases}</span>
                 </div>
               )}
               {clinicalNotes ? (
                 <div className="flex flex-col gap-1 text-xs">
                    <span className="text-gray-500 font-medium tracking-wide">Queixa/Observações:</span>
                    <span className="text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">{clinicalNotes}</span>
                 </div>
               ) : (
                 <p className="text-xs text-gray-400 italic">Nenhuma observação clínica preenchida.</p>
               )}
             </div>

             {/* Protocolo Escolhido */}
             <div className="bg-primary/5 px-4 py-2 border-y border-primary/10 font-bold text-primary text-xs uppercase tracking-wider">
               3. Protocolo e Valores
             </div>
             <div className="p-4 bg-white">
               <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2">
                  <span className="text-gray-500 whitespace-nowrap mr-4">Núcleo Selecionado:</span>
                  <span className="text-gray-900 font-bold text-right break-words">{selectedProtocol?.name}</span>
               </div>
               
               <div className="bg-gray-50 rounded p-3 mb-3 border border-gray-100">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Composição:</span>
                 <ul className="space-y-1">
                    {selectedProtocol?.services.map((serv, i) => (
                      <li key={i} className="flex flex-row justify-between text-xs">
                        <span className="text-gray-600 line-clamp-1 mr-2">• {serv.name}</span>
                        <span className="text-gray-400 shrink-0">R$ {serv.price.toFixed(2)}</span>
                      </li>
                    ))}
                 </ul>
               </div>

               <div className="flex justify-between items-center text-base pt-2">
                  <span className="text-gray-900 font-bold">Valor Total (Pacote):</span>
                  <span className="text-green-700 font-black text-lg shadow-sm bg-green-50 px-3 py-1 rounded-lg border border-green-100">R$ {selectedProtocol?.chargedPrice.toFixed(2)}</span>
               </div>
             </div>
          </div>

          <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-1/2 h-12 text-base text-gray-600 font-semibold" onClick={() => setIsConfirmModalOpen(false)}>
              Corrigir Dados
            </Button>
            <Button type="button" variant="primary" className="w-full sm:w-1/2 h-12 text-base shadow-lg" onClick={handleConfirmSubmit}>
              Confirmar e Encaminhar
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
