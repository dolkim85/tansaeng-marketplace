import { BuyerChrome } from "@/components/layout/BuyerChrome";
import { getSession } from "@/server/session";
import type { ReactNode } from "react";

export default async function BuyerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  return (
    <BuyerChrome session={session ? { name: session.name } : null}>
      {children}
    </BuyerChrome>
  );
}
