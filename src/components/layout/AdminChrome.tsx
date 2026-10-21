"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/server/auth/actions";

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/sellers", label: "판매자 심사" },
  { href: "/admin/products", label: "상품 검수" },
  { href: "/admin/group-buys", label: "공동구매" },
  { href: "/admin/orders", label: "주문/환불" },
  { href: "/admin/settlements", label: "정산" },
  { href: "/admin/ads", label: "광고" },
  { href: "/admin/notifications", label: "알림" },
  { href: "/admin/support", label: "고객센터" },
  { href: "/admin/content", label: "콘텐츠" },
  { href: "/admin/analytics", label: "통계" },
  { href: "/admin/audit", label: "감사로그" },
  { href: "/admin/settings", label: "설정" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminChrome({
  children,
  adminName,
}: {
  children: ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-brand-deepgreen focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        본문으로 바로가기
      </a>
      <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-brand-deepgreen/15 bg-brand-deepgreen/5 sm:block">
        <div className="px-4 py-4 text-lg font-bold text-brand-deepgreen">
          탄생 운영
        </div>
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-brand-deepgreen/70">
          <span>{adminName}</span>
          <form action={logoutAction}>
            <button type="submit" className="hover:underline">
              로그아웃
            </button>
          </form>
        </div>
        <nav aria-label="관리자 메뉴" className="flex flex-col gap-1 px-2 pb-6">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-brand-deepgreen/15 font-semibold text-brand-deepgreen"
                    : "text-brand-deepgreen/70 hover:bg-brand-deepgreen/10"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-brand-deepgreen/15 bg-white/70 px-4 py-3 sm:hidden">
          <span className="font-bold text-brand-deepgreen">탄생 운영</span>
          <select
            aria-label="관리자 메뉴 이동"
            className="rounded-md border border-brand-deepgreen/20 bg-white px-2 py-1 text-xs"
            defaultValue={pathname}
            onChange={(e) => {
              window.location.href = e.target.value;
            }}
          >
            {NAV.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </header>
        <main id="main-content" className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
