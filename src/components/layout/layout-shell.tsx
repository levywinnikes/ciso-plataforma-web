'use client'

import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Menu } from 'lucide-react'

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
            <span className="hidden sm:inline text-sm font-medium text-gray-600">Olá, Usuário</span>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-accent border-2 border-primary/10" />
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
