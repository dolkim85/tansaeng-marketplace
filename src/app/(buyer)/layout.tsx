import { BuyerChrome } from "@/components/layout/BuyerChrome";
import type { ReactNode } from "react";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <BuyerChrome>{children}</BuyerChrome>;
}
