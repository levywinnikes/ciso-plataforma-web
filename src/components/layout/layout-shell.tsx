import { Sidebar } from './sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="flex h-20 items-center justify-between border-b bg-white px-8">
          <h2 className="text-xl font-semibold text-primary">Portal do Colaborador</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">Olá, Usuário</span>
            <div className="h-10 w-10 rounded-full bg-accent" />
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
