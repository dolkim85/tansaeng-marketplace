import { listAllAdsForAdmin } from "@/server/ads/queries";
import { approveAdAction, rejectAdAction } from "@/server/ads/actions";

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

export default async function AdminAdsPage() {
  const ads = await listAllAdsForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/70">/admin/ads</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        광고 슬롯/심사/정산
      </h1>

      {ads.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          신청된 광고가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {ads.map((ad) => (
            <li
              key={ad.id}
              className="rounded-lg border border-brand-deepgreen/15 bg-white p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {ad.product.title} ({ad.seller.storeName}) ·{" "}
                  {PLACEMENT_LABEL[ad.placement]}
                </span>
                <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                  {STATUS_LABEL[ad.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">
                {ad.startAt.toLocaleDateString("ko-KR")} ~{" "}
                {ad.endAt.toLocaleDateString("ko-KR")} · 노출 {ad.impressions}회
                · 클릭 {ad.clicks}회
              </p>
              {ad.status === "REQUESTED" && (
                <div className="mt-2 flex gap-2">
                  <form action={approveAdAction.bind(null, ad.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      승인
                    </button>
                  </form>
                  <form action={rejectAdAction.bind(null, ad.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      반려
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
