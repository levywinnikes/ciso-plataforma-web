"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { CardSection, PageHeader } from "@/components/ui";

export default function AdminPage() {
  const t = useTranslations("adminDashboard");

  const cards = [
    {
      title: t("professionalGroupsTitle"),
      description: t("professionalGroupsDescription"),
      href: "/admin/grupos-profissionais",
    },
    {
      title: t("clinicsTitle"),
      description: t("clinicsDescription"),
      href: "/admin/clinicas",
    },
    {
      title: t("usersTitle"),
      description: t("usersDescription"),
      href: "/admin/usuarios",
    },
    {
      title: t("servicesTitle"),
      description: t("servicesDescription"),
      href: "/admin/servicos",
    },
    {
      title: t("nucleiTitle"),
      description: t("nucleiDescription"),
      href: "/admin/nucleos",
    },
    {
      title: t("financialTitle"),
      description: t("financialDescription"),
      href: "/admin/financeiro",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <CardSection
              title={card.title}
              className="h-full transition hover:shadow-md"
            >
              <p className="text-sm text-gray-600">{card.description}</p>
            </CardSection>
          </Link>
        ))}
      </div>
    </div>
  );
}
