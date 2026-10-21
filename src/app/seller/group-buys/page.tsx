import Link from "next/link";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { listGroupBuysForSeller } from "@/server/groupbuy/queries";
import { PHASE_LABEL } from "@/lib/groupBuyPhase";
import { formatKRW } from "@/lib/currency";

export default async function SellerGroupBuysPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;
  const groupBuys = result
    ? await listGroupBuysForSeller(result.seller.id)
    : [];
  const approved = result?.latestApplication?.status === "APPROVED";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-deepgreen">
          공동구매/출하예정 등록·관리
        </h1>
        {approved && (
          <Link
            href="/seller/group-buys/new"
            className="rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white"
          >
            + 공동구매 등록
          </Link>
        )}
      </div>

      {!approved && (
        <p className="mt-3 text-sm text-brand-deepgreen/70">
          입점 심사 승인 후 공동구매를 등록할 수 있습니다.
        </p>
      )}

      {groupBuys.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          등록된 공동구매가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {groupBuys.map((gb) => (
            <li
              key={gb.id}
              className="rounded-lg border border-brand-green/15 bg-white p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {gb.title}
                </span>
                <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                  {PHASE_LABEL[gb.phase]}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">
                {formatKRW(gb.priceKrw)} · 목표 {gb.targetQty} / 결제완료{" "}
                {gb.confirmedQty} / 예약(결제대기 포함) {gb.committedQty} /
                최대 {gb.maxQty}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
