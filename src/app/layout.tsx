import "./globals.css";

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";

import { resolveLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CISO | Plataforma de Encaminhamentos",
  description: "Gestao de encaminhamentos, triagem e atendimento especializado",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = resolveLocale(cookies().get("locale")?.value);
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className={manrope.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
