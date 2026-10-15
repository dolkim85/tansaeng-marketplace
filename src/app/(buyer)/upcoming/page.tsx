import Link from "next/link";
import { listUpcomingGroupBuys } from "@/server/groupbuy/queries";

function dDay(openAt: Date): string {
  const diffMs = openAt.getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days <= 0 ? "D-Day" : `D-${days}`;
}

export default async function UpcomingPage() {
  const upcoming = await listUpcomingGroupBuys();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/upcoming</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        출하예정/오픈예정 캘린더
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/50">
        알림 신청은 수요 집계용일 뿐 실제 주문이 아닙니다.
      </p>

      {upcoming.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          오픈예정인 공동구매가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {upcoming.map((gb) => (
            <li key={gb.id}>
              <Link
                href={`/group-buys/${gb.id}`}
                className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-4 hover:bg-brand-green/5"
              >
                <div>
                  <p className="text-sm font-medium text-brand-deepgreen">
                    {gb.title}
                  </p>
                  <p className="text-xs text-brand-deepgreen/60">
                    {gb.product.seller.storeName} · 오픈{" "}
                    {gb.openAt.toLocaleString("ko-KR")}
                  </p>
                </div>
                <span className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                  {dDay(gb.openAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
