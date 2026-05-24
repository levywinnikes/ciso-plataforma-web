import "./globals.css";

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";

import { AppSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { resolveLocale } from "@/i18n/config";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Integra Visão | Plataforma de Encaminhamentos",
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
        <AppSessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NextTopLoader
              color="#10b981"
              showSpinner={false}
              shadow="0 0 10px #10b981,0 0 5px #10b981"
            />
            {children}
          </NextIntlClientProvider>
          <Toaster />
        </AppSessionProvider>
      </body>
    </html>
  );
}
