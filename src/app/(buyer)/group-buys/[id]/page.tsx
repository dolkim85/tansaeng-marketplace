import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGroupBuyDetail, isAlerted } from "@/server/groupbuy/queries";
import { toggleGroupBuyAlertAction } from "@/server/groupbuy/actions";
import { getSession } from "@/server/session";
import { formatKRW } from "@/lib/currency";
import { PHASE_LABEL } from "@/lib/groupBuyPhase";
import { JoinForm } from "./JoinForm";
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gb = await getGroupBuyDetail(id);
  if (!gb) return {};

  const description = `${gb.product.seller.storeName}의 "${gb.title}" 공동구매 — ${formatKRW(
    gb.priceKrw
  )}, 목표 ${gb.targetQty}개.`;
  const url = absoluteUrl(`/group-buys/${id}`);
  return {
    title: gb.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: gb.title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE }],
      type: "website",
    },
  };
}

export default async function GroupBuyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gb = await getGroupBuyDetail(id);
  if (!gb) notFound();

  const session = await getSession();
  const alerted = session ? await isAlerted(session.sub, gb.id) : false;
  const pct = Math.min(Math.round((gb.confirmedQty / gb.targetQty) * 100), 100);
  const remaining = Math.max(gb.maxQty - gb.committedQty, 0);

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/group-buys/{id}</p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-deepgreen">
          {gb.title}
        </h1>
        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
          {PHASE_LABEL[gb.phase]}
        </span>
      </div>
      <p className="mt-1 text-sm text-brand-deepgreen/70">
        <Link href={`/farms/${gb.product.seller.storeSlug}`} className="hover:underline">
          {gb.product.seller.storeName}
        </Link>{" "}
        ·{" "}
        <Link href={`/products/${gb.product.slug}`} className="hover:underline">
          {gb.product.title}
        </Link>
      </p>

      <div className="mt-4 rounded-lg border border-brand-green/15 bg-white p-4">
        <p className="text-lg font-bold text-brand-green">
          {formatKRW(gb.priceKrw)}
        </p>
        <p className="mt-2 text-xs text-brand-deepgreen/70">
          목표 {gb.targetQty} / 결제 완료 {gb.confirmedQty} ({pct}%) · 남은 공급 가능
          수량 {remaining}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-green/10">
          <div
            className="h-full rounded-full bg-brand-green"
            style={{ width: `${pct}%` }}
          />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-brand-deepgreen/70">
          <div>
            <dt className="text-brand-deepgreen/70">오픈</dt>
            <dd>{gb.openAt.toLocaleString("ko-KR")}</dd>
          </div>
          <div>
            <dt className="text-brand-deepgreen/70">마감</dt>
            <dd>{gb.closeAt.toLocaleString("ko-KR")}</dd>
          </div>
          <div>
            <dt className="text-brand-deepgreen/70">예상 출고일</dt>
            <dd>{gb.expectedShipAt.toLocaleDateString("ko-KR")}</dd>
          </div>
          {gb.perUserLimit > 0 && (
            <div>
              <dt className="text-brand-deepgreen/70">1인당 제한</dt>
              <dd>{gb.perUserLimit}개</dd>
            </div>
          )}
        </dl>
      </div>

      {gb.phase === "TEASER" && (
        <form action={toggleGroupBuyAlertAction.bind(null, gb.id)} className="mt-4">
          <button
            type="submit"
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              alerted
                ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                : "border-brand-green/30 text-brand-deepgreen hover:bg-brand-green/10"
            }`}
          >
            {alerted ? "🔔 알림 신청됨" : "🔔 오픈 알림 신청"}
          </button>
          <p className="mt-1 text-xs text-brand-deepgreen/70">
            알림 신청은 수요 집계용일 뿐 실제 주문이 아닙니다.
          </p>
        </form>
      )}

      {gb.phase === "OPEN" && remaining > 0 && <JoinForm groupBuyId={gb.id} />}
      {gb.phase === "OPEN" && remaining === 0 && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          최대 공급 수량에 도달했습니다.
        </p>
      )}
      {gb.phase === "AWAITING_FINALIZATION" && (
        <p className="mt-4 text-sm text-brand-deepgreen/70">
          마감되었습니다. 성사 여부는 운영자 확인 후 반영됩니다.
        </p>
      )}
      {gb.phase === "SUCCEEDED" && (
        <p className="mt-4 text-sm font-semibold text-brand-green">
          목표 수량 달성 — 공동구매가 성사되었습니다.
        </p>
      )}
      {(gb.phase === "FAILED" || gb.phase === "CANCELLED") && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {gb.phase === "FAILED"
            ? "목표 수량 미달로 성사되지 않았습니다. 결제하신 분들은 자동 환불 처리되었습니다."
            : "운영자에 의해 취소되었습니다. 결제하신 분들은 자동 환불 처리되었습니다."}
        </p>
      )}
    </section>
  );
}
