import Link from "next/link";
import { listOpenGroupBuys, listUpcomingGroupBuys } from "@/server/groupbuy/queries";
import { getActiveHomeBannerAd } from "@/server/ads/queries";
import { getActiveBanner, listRecentNotices } from "@/server/content/queries";
import { formatKRW } from "@/lib/currency";

function dDay(openAt: Date): string {
  const days = Math.ceil((openAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days <= 0 ? "D-Day" : `D-${days}`;
}

export default async function BuyerHomePage() {
  const [upcoming, openGroupBuys, bannerAd, banner, notices] = await Promise.all([
    listUpcomingGroupBuys(),
    listOpenGroupBuys(),
    getActiveHomeBannerAd(),
    getActiveBanner(),
    listRecentNotices(3),
  ]);

  const bannerContent = (
    <>
      <p className="text-xs font-semibold text-brand-green">
        이번 주 공동구매 · 출하 예정
      </p>
      <h1 className="mt-2 text-xl font-bold sm:text-2xl">
        {banner?.title ?? "산지에서 바로, 탄생과 함께"}
      </h1>
      {banner?.subtitle && (
        <p className="mt-1 text-sm text-brand-deepgreen/70">{banner.subtitle}</p>
      )}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      {banner?.linkUrl ? (
        <Link
          href={banner.linkUrl}
          aria-label="메인 배너"
          className="block rounded-xl bg-brand-green/10 p-6 text-brand-deepgreen"
        >
          {bannerContent}
        </Link>
      ) : (
        <section
          aria-label="메인 배너"
          className="rounded-xl bg-brand-green/10 p-6 text-brand-deepgreen"
        >
          {bannerContent}
        </section>
      )}

      {bannerAd && (
        <Link
          href={`/api/ads/${bannerAd.id}/click`}
          className="relative mt-4 block overflow-hidden rounded-xl border border-brand-orange/40 bg-brand-orange/10 p-4"
        >
          <span className="absolute left-3 top-3 rounded bg-brand-orange px-1.5 py-0.5 text-[10px] font-semibold text-white">
            광고
          </span>
          <p className="mt-4 text-sm font-semibold text-brand-deepgreen">
            {bannerAd.product.title}
          </p>
          <p className="text-xs text-brand-deepgreen/60">
            {bannerAd.product.seller.storeName} ·{" "}
            {formatKRW(bannerAd.product.priceKrw)}
          </p>
        </Link>
      )}

      <section aria-label="출하예정" className="mt-8">
        <h2 className="text-base font-semibold text-brand-deepgreen">
          곧 오픈
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-brand-deepgreen/50">
            오픈예정인 공동구매가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upcoming.slice(0, 4).map((gb) => (
              <li key={gb.id}>
                <Link
                  href={`/group-buys/${gb.id}`}
                  className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-4 text-sm hover:bg-brand-green/5"
                >
                  <span>{gb.title}</span>
                  <span className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                    {dDay(gb.openAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/upcoming"
          className="mt-3 inline-block text-sm text-brand-green underline-offset-2 hover:underline"
        >
          출하예정 전체 보기 →
        </Link>
      </section>

      <section aria-label="진행중인 공동구매" className="mt-8">
        <h2 className="text-base font-semibold text-brand-deepgreen">
          오늘 판매 중인 공동구매
        </h2>
        {openGroupBuys.length === 0 ? (
          <p className="mt-3 text-sm text-brand-deepgreen/50">
            진행 중인 공동구매가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {openGroupBuys.slice(0, 4).map((gb) => {
              const pct = Math.min(
                Math.round((gb.confirmedQty / gb.targetQty) * 100),
                100
              );
              return (
                <li key={gb.id}>
                  <Link
                    href={`/group-buys/${gb.id}`}
                    className="block rounded-lg border border-brand-green/15 bg-white p-4 text-sm hover:bg-brand-green/5"
                  >
                    <p className="font-medium">{gb.title}</p>
                    <p className="mt-1 text-xs text-brand-deepgreen/60">
                      목표 {gb.targetQty} / 현재 {gb.confirmedQty} ({pct}%)
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
        <Link
          href="/group-buys"
          className="mt-3 inline-block text-sm text-brand-green underline-offset-2 hover:underline"
        >
          공동구매 모아보기 →
        </Link>
      </section>

      <section aria-label="공지사항" className="mt-8">
        <h2 className="text-base font-semibold text-brand-deepgreen">
          공지사항
        </h2>
        {notices.length === 0 ? (
          <p className="mt-3 text-sm text-brand-deepgreen/50">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {notices.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-brand-deepgreen">
                    {n.isPinned && (
                      <span className="mr-1 rounded bg-brand-orange/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-orange">
                        고정
                      </span>
                    )}
                    {n.title}
                  </span>
                  <span className="text-xs text-brand-deepgreen/50">
                    {n.createdAt.toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-deepgreen/70">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="카테고리 탐색" className="mt-8">
        <h2 className="text-base font-semibold text-brand-deepgreen">
          지역별·품목별 탐색
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/category/agriculture"
            className="rounded-full border border-brand-green/20 px-3 py-1.5 text-sm text-brand-deepgreen hover:bg-brand-green/10"
          >
            농산물
          </Link>
          <Link
            href="/category/livestock"
            className="rounded-full border border-brand-green/20 px-3 py-1.5 text-sm text-brand-deepgreen hover:bg-brand-green/10"
          >
            축산물
          </Link>
          <Link
            href="/category/seafood"
            className="rounded-full border border-brand-green/20 px-3 py-1.5 text-sm text-brand-deepgreen hover:bg-brand-green/10"
          >
            수산물
          </Link>
        </div>
      </section>
    </div>
  );
}
