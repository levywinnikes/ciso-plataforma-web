"use client";

import {
  BarChart3,
  Briefcase,
  Building2,
  ChevronDown,
  Layers,
  LayoutDashboard,
  Link2,
  Package,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { UserRole } from "@/features/auth/types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type SidebarSectionsState = {
  overview: boolean;
  registrations: boolean;
  operations: boolean;
  analytics: boolean;
};

const SIDEBAR_SECTIONS_STORAGE_KEY = "integra.sidebar.admin.sections";

const defaultExpandedSections: SidebarSectionsState = {
  overview: true,
  registrations: true,
  operations: true,
  analytics: true,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations("sidebar");
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role as UserRole | undefined;
  const [expandedSections, setExpandedSections] =
    useState<SidebarSectionsState>(defaultExpandedSections);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(
        SIDEBAR_SECTIONS_STORAGE_KEY,
      );
      if (!storedValue) return;

      const parsed = JSON.parse(storedValue) as Partial<SidebarSectionsState>;
      setExpandedSections({
        ...defaultExpandedSections,
        ...parsed,
      });
    } catch {
      setExpandedSections(defaultExpandedSections);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_SECTIONS_STORAGE_KEY,
      JSON.stringify(expandedSections),
    );
  }, [expandedSections]);

  const navItems = {
    professional: {
      name: t("nav.professional"),
      href: "/profissional",
      icon: LayoutDashboard,
    },
    doctor: {
      name: t("nav.doctor"),
      href: "/medico",
      icon: Stethoscope,
    },
    admin: {
      name: t("nav.admin"),
      href: "/admin",
      icon: LayoutDashboard,
    },
    nuclei: {
      name: t("nav.nuclei"),
      href: "/admin/nucleos",
      icon: Layers,
    },
    clinics: {
      name: t("nav.clinics"),
      href: "/admin/clinicas",
      icon: Building2,
    },
    professionals: {
      name: t("nav.professionalGroups"),
      href: "/admin/grupos-profissionais",
      icon: Briefcase,
    },
    users: {
      name: t("nav.users"),
      href: "/admin/usuarios",
      icon: Users,
    },
    organizationUsers: {
      name: "Colaboradores", // hardcoded temporarily if translation doesn't exist
      href: "/organizacao/usuarios",
      icon: Users,
    },
    accesses: {
      name: t("nav.accesses"),
      href: "/admin/acessos",
      icon: Link2,
    },
    services: {
      name: t("nav.services"),
      href: "/admin/servicos",
      icon: Package,
    },
    convenios: {
      name: t("nav.agreements"),
      href: "/admin/convenios",
      icon: Link2,
    },
    financial: {
      name: t("nav.financial"),
      href: "/admin/financeiro",
      icon: BarChart3,
    },
  };

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function toggleSection(section: keyof typeof expandedSections) {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function renderNavLink(item: {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
  }) {
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-accent text-accent-foreground"
            : "text-white hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
        {item.name}
      </Link>
    );
  }

  const adminSections = [
    {
      key: "overview" as const,
      label: t("sections.overview"),
      items: [navItems.admin],
    },
    {
      key: "registrations" as const,
      label: t("sections.registrations"),
      items: [
        navItems.professionals,
        navItems.clinics,
        navItems.convenios,
        navItems.users,
      ],
    },
    {
      key: "operations" as const,
      label: t("sections.operations"),
      items: [navItems.nuclei, navItems.services],
    },
    {
      key: "analytics" as const,
      label: t("sections.analytics"),
      items: [navItems.financial],
    },
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
        <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
          {role === "PROFISSIONAL" ? (
            <>
              {renderNavLink(navItems.professional)}
              {renderNavLink(navItems.organizationUsers)}
            </>
          ) : null}
          {role === "MEDICO" ? (
            <>
              {renderNavLink(navItems.doctor)}
              {renderNavLink(navItems.organizationUsers)}
            </>
          ) : null}

          {role === "ADMINISTRATIVO"
            ? adminSections.map((section) => {
                const isExpanded = expandedSections[section.key];

                return (
                  <section
                    key={section.key}
                    className="rounded-xl border border-white/10 bg-white/5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-white/70"
                    >
                      <span>{section.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {isExpanded ? (
                      <div className="space-y-1 border-t border-white/10 p-2">
                        {section.items.map((item) => renderNavLink(item))}
                      </div>
                    ) : null}
                  </section>
                );
              })
            : null}
        </nav>
        <div className="border-t border-primary-foreground/10 p-4 text-center font-mono text-xs opacity-50">
          v1.0.0-prototype
        </div>
      </div>
    </>
  );
}
