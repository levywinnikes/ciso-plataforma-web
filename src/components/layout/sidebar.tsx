import Link from 'next/link'
import { LayoutDashboard, Users, ClipboardList, Stethoscope, Search } from 'lucide-react'

const navItems = [
  { name: 'Painel Optometrista', href: '/optometrista', icon: LayoutDashboard },
  { name: 'Triagem (Centro)', href: '/centro', icon: Search },
  { name: 'Painel Médico', href: '/medico', icon: Stethoscope },
]

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-primary text-white">
      <div className="flex h-20 items-center justify-center border-b border-primary-foreground/10 px-6">
        <h1 className="text-xl font-bold tracking-tight">CISO Plataforma</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="border-t border-primary-foreground/10 p-4 font-mono text-xs opacity-50 text-center">
        v1.0.0-prototype
      </div>
    </div>
  )
}
