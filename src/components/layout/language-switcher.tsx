"use client";

import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale();

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === locale) return;

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });

    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-1 rounded-md border border-gray-200 bg-gray-50 p-1">
      <button
        onClick={() => handleLocaleChange("pt-BR")}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
          locale === "pt-BR"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        PT
      </button>
      <button
        onClick={() => handleLocaleChange("en-US")}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
          locale === "en-US"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
