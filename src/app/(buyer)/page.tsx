import Link from "next/link";
import { listOpenGroupBuys, listUpcomingGroupBuys } from "@/server/groupbuy/queries";

function dDay(openAt: Date): string {
  const days = Math.ceil((openAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days <= 0 ? "D-Day" : `D-${days}`;
}

export default async function BuyerHomePage() {
  const [upcoming, openGroupBuys] = await Promise.all([
    listUpcomingGroupBuys(),
    listOpenGroupBuys(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <section
        aria-label="메인 배너"
        className="rounded-xl bg-brand-green/10 p-6 text-brand-deepgreen"
      >
        <p className="text-xs font-semibold text-brand-green">
          이번 주 공동구매 · 출하 예정
        </p>
        <h1 className="mt-2 text-xl font-bold sm:text-2xl">
          산지에서 바로, 탄생과 함께
        </h1>
      </section>

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
