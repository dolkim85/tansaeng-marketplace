import { AdminChrome } from "@/components/layout/AdminChrome";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
