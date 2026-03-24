'use client'

import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Menu, LogOut } from 'lucide-react'
import Link from 'next/link'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-20 items-center justify-between border-b bg-white px-4 md:px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-primary hover:bg-gray-100 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-primary truncate">Portal do Colaborador</h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-gray-700">Olá, Usuário</span>
              <Link href="/login" className="text-xs text-red-500 hover:text-red-700 font-medium inline-flex items-center justify-end transition-colors mt-0.5" title="Encerrar sessão e voltar ao login">
                Sair do sistema
                <LogOut className="h-3 w-3 ml-1" />
              </Link>
            </div>
            <Link href="/login" className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-accent border-2 border-primary/10 flex items-center justify-center text-white hover:ring-2 hover:ring-accent/50 cursor-pointer shadow-sm transition-all text-sm font-bold" title="Sair do sistema">
              U
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
