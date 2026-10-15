import { AdminChrome } from "@/components/layout/AdminChrome";
import { getSession } from "@/server/session";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  return (
    <AdminChrome adminName={session?.name ?? ""}>{children}</AdminChrome>
  );
}
