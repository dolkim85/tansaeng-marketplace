import type { Metadata } from "next";
import Link from "next/link";
import { listAllGroupBuys } from "@/server/groupbuy/queries";
import { PHASE_LABEL } from "@/lib/groupBuyPhase";
import { formatKRW } from "@/lib/currency";
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

const TITLE = "공동구매 모아보기";
const DESCRIPTION = "산지에서 바로, 진행 중이거나 곧 열리는 공동구매를 한눈에 확인하세요.";
const URL = absoluteUrl("/group-buys");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
};

export default async function GroupBuysPage() {
  const groupBuys = await listAllGroupBuys();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/group-buys</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        공동구매 모아보기
      </h1>

      {groupBuys.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          등록된 공동구매가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {groupBuys.map((gb) => {
            const pct = Math.min(
              Math.round((gb.confirmedQty / gb.targetQty) * 100),
              100
            );
            return (
              <li key={gb.id}>
                <Link
                  href={`/group-buys/${gb.id}`}
                  className="block rounded-lg border border-brand-green/15 bg-white p-4 hover:bg-brand-green/5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-brand-deepgreen">
                      {gb.title}
                    </p>
                    <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                      {PHASE_LABEL[gb.phase]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-deepgreen/70">
                    {gb.product.seller.storeName} · {formatKRW(gb.priceKrw)}
                  </p>
                  <p className="mt-1 text-xs text-brand-deepgreen/70">
                    목표 {gb.targetQty} / 현재 결제 완료 {gb.confirmedQty} (
                    {pct}%)
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-green/10">
                    <div
                      className="h-full rounded-full bg-brand-green"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
