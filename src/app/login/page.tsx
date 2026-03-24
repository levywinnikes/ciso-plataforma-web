'use client'

import React, { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Search, Stethoscope, Briefcase } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<string>('optometrista')

  const profiles = [
    { id: 'optometrista', name: 'Optometrista', icon: LayoutDashboard, path: '/optometrista' },
    { id: 'centro', name: 'Clínica / Triagem', icon: Search, path: '/centro' },
    { id: 'medico', name: 'Médico Especialista', icon: Stethoscope, path: '/medico' },
    { id: 'admin', name: 'Administrativo', icon: Briefcase, path: '/admin' },
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const profile = profiles.find(p => p.id === selectedProfile)
    if (profile) {
      router.push(profile.path)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary text-white flex items-center justify-center rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-bold">CISO</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Acesso à Plataforma</h2>
          <p className="mt-2 text-sm text-gray-500">Selecione seu perfil de simulação</p>
        </div>

        <Card className="p-8 shadow-xl border-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="grid grid-cols-2 gap-3">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProfile(p.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      selectedProfile === p.id 
                        ? 'border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p.icon className={`h-6 w-6 mb-2 ${selectedProfile === p.id ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-xs font-semibold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">E-mail ou Usuário</label>
                <Input type="text" placeholder="demo@ciso.com.br" defaultValue="demo@ciso.com.br" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <Input type="password" placeholder="••••••••" defaultValue="123456" />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full h-12 text-base">
              Entrar
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-500">
          <Link href="/" className="hover:text-primary transition-colors font-medium">
            &larr; Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  )
}
