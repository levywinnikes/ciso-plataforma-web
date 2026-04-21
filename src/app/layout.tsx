import "./globals.css";

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { resolveLocale } from "@/i18n/config";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CISO | Plataforma de Encaminhamentos",
  description: "Gestao de encaminhamentos, triagem e atendimento especializado",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = resolveLocale((await cookies()).get("locale")?.value);
  const messages = await getMessages({ locale });

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
