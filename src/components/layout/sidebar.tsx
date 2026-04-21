import {
  BarChart3,
  Layers,
  LayoutDashboard,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations("sidebar");

  const navItems = [
    {
      name: t("nav.professional"),
      href: "/profissional",
      icon: LayoutDashboard,
    },
    { name: t("nav.admin"), href: "/admin", icon: Layers },
    { name: t("nav.clinic"), href: "/clinica", icon: Search },
    { name: t("nav.doctor"), href: "/medico", icon: Stethoscope },
    { name: t("nav.financial"), href: "/admin/financeiro", icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-primary-foreground/10 px-6">
          <h1 className="text-xl font-bold tracking-tight">{t("brand")}</h1>
          <button onClick={onClose} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t border-primary-foreground/10 p-4 text-center font-mono text-xs opacity-50">
          v1.0.0-prototype
        </div>
      </div>
    </>
  );
}
