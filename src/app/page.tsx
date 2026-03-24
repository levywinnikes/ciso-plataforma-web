'use client'

import React from 'react'
import Link from 'next/link'
import { Card, Button } from '@/components/ui'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-20 items-center justify-between border-b px-12">
        <h1 className="text-2xl font-bold text-primary">CISO</h1>
        <nav>
          <Link href="/login">
            <Button variant="primary" className="font-bold px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Acesso Restrito
            </Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex flex-1 flex-col items-center justify-center space-y-12 p-12 text-center">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-5xl font-extrabold text-primary">
            Gestão Inteligente para <span className="text-accent">Saúde Ocular</span>
          </h2>
          <p className="text-xl text-gray-600">
            Conectando optometristas, núcleos especializados e médicos para um atendimento oftalmológico mais ágil e eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="flex flex-col items-center p-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">1</div>
            <h3 className="text-lg font-bold text-primary">Encaminhamento</h3>
            <p className="text-sm text-gray-500">Optometristas realizam a triagem primária e enviam o paciente ao centro.</p>
          </Card>
          <Card className="flex flex-col items-center p-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xl">2</div>
            <h3 className="text-lg font-bold text-primary">Triagem Técnica</h3>
            <p className="text-sm text-gray-500">O Centro direciona o paciente ao Núcleo Especializado correspondente.</p>
          </Card>
          <Card className="flex flex-col items-center p-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">3</div>
            <h3 className="text-lg font-bold text-primary">Atendimento Médico</h3>
            <p className="text-sm text-gray-500">Especialistas realizam o atendimento final e emitem o laudo técnico.</p>
          </Card>
        </div>
      </main>
      
      <footer className="h-20 bg-primary text-white flex items-center justify-center text-sm">
        &copy; 2026 CISO - Centro Integrado de Saúde Ocular. Todos os direitos reservados.
      </footer>
    </div>
  )
}
