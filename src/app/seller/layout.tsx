import { SellerChrome } from "@/components/layout/SellerChrome";
import { getSession } from "@/server/session";
import type { ReactNode } from "react";

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  return (
    <SellerChrome sellerName={session?.name ?? ""}>{children}</SellerChrome>
  );
}
