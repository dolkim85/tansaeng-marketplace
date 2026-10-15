"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/seller", label: "현황" },
  { href: "/seller/products", label: "상품" },
  { href: "/seller/orders", label: "주문" },
  { href: "/seller/settlements", label: "정산" },
  { href: "/seller/support", label: "더보기" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/seller") return pathname === "/seller";
  return pathname.startsWith(href);
}

export function SellerChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <aside className="hidden w-56 shrink-0 border-r border-brand-green/15 bg-white/60 sm:block">
        <div className="px-4 py-4 text-lg font-bold text-brand-green">
          탄생 판매자
        </div>
        <nav aria-label="판매자 메뉴" className="flex flex-col gap-1 px-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-brand-green/10 font-semibold text-brand-green"
                    : "text-brand-deepgreen/70 hover:bg-brand-green/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/seller/onboarding"
            className="mt-2 rounded-md px-3 py-2 text-sm text-brand-deepgreen/50 hover:bg-brand-green/5"
          >
            입점 심사 상태
          </Link>
          <Link
            href="/seller/group-buys"
            className="rounded-md px-3 py-2 text-sm text-brand-deepgreen/50 hover:bg-brand-green/5"
          >
            공동구매
          </Link>
          <Link
            href="/seller/ads"
            className="rounded-md px-3 py-2 text-sm text-brand-deepgreen/50 hover:bg-brand-green/5"
          >
            광고
          </Link>
          <Link
            href="/seller/store"
            className="rounded-md px-3 py-2 text-sm text-brand-deepgreen/50 hover:bg-brand-green/5"
          >
            스토어 소개
          </Link>
        </nav>
      </aside>

      <main className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</main>

      <nav
        aria-label="판매자 하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-green/15 bg-white/95 backdrop-blur sm:hidden"
      >
        <ul className="mx-auto flex max-w-5xl">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                    active
                      ? "font-semibold text-brand-green"
                      : "text-brand-deepgreen/60"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
