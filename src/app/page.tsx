import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { resolveRolePath } from "@/features/auth/service";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  redirect(resolveRolePath(session.user.role));
}
