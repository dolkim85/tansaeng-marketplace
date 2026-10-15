"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const BOTTOM_NAV = [
  { href: "/", label: "홈" },
  { href: "/categories", label: "카테고리" },
  { href: "/group-buys", label: "공동구매" },
  { href: "/wishlist", label: "찜" },
  { href: "/account", label: "마이" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function BuyerChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-brand-green/15 bg-brand-ivory/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold tracking-tight text-brand-green"
          >
            탄생
          </Link>
          <form
            role="search"
            className="flex-1"
            action="/search"
            aria-label="상품 검색"
          >
            <input
              type="search"
              name="q"
              placeholder="품목, 생산자, 지역으로 검색"
              className="w-full rounded-full border border-brand-green/20 bg-white px-4 py-2 text-sm text-brand-deepgreen placeholder:text-brand-deepgreen/40 focus:outline-none focus:ring-2 focus:ring-brand-green/40"
            />
          </form>
          <Link
            href="/alerts"
            className="shrink-0 rounded-full p-2 text-brand-deepgreen hover:bg-brand-green/10"
            aria-label="알림"
          >
            🔔
          </Link>
          <Link
            href="/account"
            className="shrink-0 rounded-full p-2 text-brand-deepgreen hover:bg-brand-green/10"
            aria-label="로그인/마이"
          >
            👤
          </Link>
        </div>
        <nav
          aria-label="전체 카테고리"
          className="mx-auto hidden w-full max-w-5xl gap-4 px-6 pb-3 text-sm text-brand-deepgreen/80 sm:flex"
        >
          <Link href="/category/agriculture" className="hover:text-brand-green">
            농산물
          </Link>
          <Link href="/category/livestock" className="hover:text-brand-green">
            축산물
          </Link>
          <Link href="/category/seafood" className="hover:text-brand-green">
            수산물
          </Link>
          <Link href="/upcoming" className="hover:text-brand-green">
            출하예정
          </Link>
          <Link href="/group-buys" className="hover:text-brand-green">
            공동구매
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</main>

      <nav
        aria-label="하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-green/15 bg-white/95 backdrop-blur sm:hidden"
      >
        <ul className="mx-auto flex max-w-5xl">
          {BOTTOM_NAV.map((item) => {
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

      <footer className="hidden border-t border-brand-green/15 bg-white/60 px-6 py-6 text-xs text-brand-deepgreen/60 sm:block">
        판매주체 고지 · 고객센터 · 이용약관 · 사업자 정보 (추후 CMS 연동)
      </footer>
    </div>
  );
}
