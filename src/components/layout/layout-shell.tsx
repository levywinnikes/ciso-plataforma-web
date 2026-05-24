"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { LanguageSwitcher } from "./language-switcher";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations("common");

  const userName = session?.user?.name || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  const isGlobalAdmin = session?.user?.role === "ADMINISTRATIVO";
  const orgName = session?.user?.organizationName;
  const userRole = isGlobalAdmin ? "Gestor Global" : orgName || "Usuário";

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between border-b bg-white px-4 md:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-primary hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="truncate text-lg font-semibold text-primary md:text-xl">
              Portal do Colaborador
            </h2>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <LanguageSwitcher />

            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 md:space-x-4 md:pl-6">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-sm font-bold text-gray-700">
                  {t("hello", { name: userName.split(" ")[0] })}
                </span>
                <span className="text-[10px] font-semibold uppercase text-gray-400">
                  {userRole}
                </span>
                <Link
                  href="/login"
                  className="mt-1 inline-flex items-center justify-end text-xs font-medium text-red-500 transition-colors hover:text-red-700"
                  title={t("logout")}
                >
                  {t("logout")}
                  <LogOut className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <Link
                href="/login"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-primary/10 bg-accent text-sm font-bold text-white shadow-sm transition-all hover:ring-2 hover:ring-accent/50 md:h-10 md:w-10"
                title={t("logout")}
              >
                {userInitial}
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
