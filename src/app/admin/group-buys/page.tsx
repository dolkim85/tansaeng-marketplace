import { listAllGroupBuys } from "@/server/groupbuy/queries";
import {
  cancelGroupBuyAction,
  finalizeGroupBuyAction,
} from "@/server/groupbuy/actions";
import { PHASE_LABEL } from "@/lib/groupBuyPhase";
import { formatKRW } from "@/lib/currency";

export default async function AdminGroupBuysPage() {
  const groupBuys = await listAllGroupBuys();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/70">
        /admin/group-buys
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        공동구매 운영·승인
      </h1>

      {groupBuys.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          등록된 공동구매가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {groupBuys.map((gb) => (
            <li
              key={gb.id}
              className="rounded-lg border border-brand-deepgreen/15 bg-white p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {gb.title} ({gb.product.seller.storeName})
                </span>
                <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                  {PHASE_LABEL[gb.phase]}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">
                {formatKRW(gb.priceKrw)} · 목표 {gb.targetQty} / 결제완료{" "}
                {gb.confirmedQty} / 최대 {gb.maxQty} · 마감{" "}
                {gb.closeAt.toLocaleString("ko-KR")}
              </p>

              {gb.status === "SCHEDULED" && (
                <div className="mt-2 flex gap-2">
                  {gb.phase === "AWAITING_FINALIZATION" && (
                    <form action={finalizeGroupBuyAction.bind(null, gb.id)}>
                      <button
                        type="submit"
                        className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        마감 처리(성사/미성사 확정)
                      </button>
                    </form>
                  )}
                  <form action={cancelGroupBuyAction.bind(null, gb.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      행사 취소
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
