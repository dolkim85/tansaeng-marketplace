import Link from "next/link";

const MOCK_UPCOMING = [
  { id: "u1", title: "제철 햇양파 출하예정", dday: "D-5" },
  { id: "u2", title: "노지 감귤 공동구매 오픈예정", dday: "D-2" },
];

const MOCK_GROUP_BUYS = [
  { id: "g1", title: "무농약 감자 10kg", target: 200, current: 128 },
  { id: "g2", title: "건해삼 선물세트", target: 80, current: 35 },
];

export default function BuyerHomePage() {
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
        <p className="mt-1 text-sm text-brand-deepgreen/70">
          (M0 자리표시자 — 실데이터 연동은 M1/M2에서 구현)
        </p>
      </section>

      <section aria-label="출하예정" className="mt-8">
        <h2 className="text-base font-semibold text-brand-deepgreen">
          곧 오픈
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOCK_UPCOMING.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-4 text-sm"
            >
              <span>{item.title}</span>
              <span className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                {item.dday}
              </span>
            </li>
          ))}
        </ul>
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
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOCK_GROUP_BUYS.map((item) => {
            const pct = Math.round((item.current / item.target) * 100);
            return (
              <li
                key={item.id}
                className="rounded-lg border border-brand-green/15 bg-white p-4 text-sm"
              >
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-brand-deepgreen/60">
                  목표 {item.target} / 현재 {item.current} ({pct}%)
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-green/10">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
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

      <p className="mt-10 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-4 text-xs text-brand-deepgreen/60">
        M0 단계: 홈 화면 레이아웃 뼈대만 구현됨(Mock 데이터). 실제 상품/공동구매
        데이터 연동은 M1·M2에서 진행 예정.
      </p>
    </div>
  );
}
