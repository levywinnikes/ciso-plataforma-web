import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { DashboardLayout } from "@/components/layout/layout-shell";
import { authOptions } from "@/lib/auth";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
