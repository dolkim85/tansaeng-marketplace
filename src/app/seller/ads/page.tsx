import Link from "next/link";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { listSellerAds } from "@/server/ads/queries";

const PLACEMENT_LABEL: Record<string, string> = {
  SEARCH: "검색 스폰서",
  CATEGORY_TOP: "카테고리 상단",
  HOME_BANNER: "홈 배너",
};

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "심사 대기",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
};

export default async function SellerAdsPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;
  const ads = result ? await listSellerAds(result.seller.id) : [];
  const approved = result?.latestApplication?.status === "APPROVED";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-deepgreen">
          광고 신청/성과
        </h1>
        {approved && (
          <Link
            href="/seller/ads/new"
            className="rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white"
          >
            + 광고 신청
          </Link>
        )}
      </div>

      {!approved && (
        <p className="mt-3 text-sm text-brand-deepgreen/60">
          입점 심사 승인 후 광고를 신청할 수 있습니다.
        </p>
      )}

      {ads.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          신청한 광고가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {ads.map((ad) => (
            <li
              key={ad.id}
              className="rounded-lg border border-brand-green/15 bg-white p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {ad.product.title} · {PLACEMENT_LABEL[ad.placement]}
                </span>
                <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                  {STATUS_LABEL[ad.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/60">
                {ad.startAt.toLocaleDateString("ko-KR")} ~{" "}
                {ad.endAt.toLocaleDateString("ko-KR")} · 노출 {ad.impressions}회
                · 클릭 {ad.clicks}회
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
