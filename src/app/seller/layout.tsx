import { SellerChrome } from "@/components/layout/SellerChrome";
import type { ReactNode } from "react";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return <SellerChrome>{children}</SellerChrome>;
}
