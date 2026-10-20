import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import {
  getPendingGrossForSeller,
  listSettlementsForSeller,
} from "@/server/settlement/queries";
import { calcSettlement } from "@/lib/settlement";
import { getCommissionRate } from "@/server/platformSettings/queries";
import { formatKRW } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "정산대기",
  APPROVED: "지급완료(모의)",
};

export default async function SellerSettlementsPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-sm text-brand-deepgreen/60">판매자 정보가 없습니다.</p>
      </div>
    );
  }

  const [pendingGrossKrw, settlements, commissionRate] = await Promise.all([
    getPendingGrossForSeller(result.seller.id),
    listSettlementsForSeller(result.seller.id),
    getCommissionRate(),
  ]);
  const pending = calcSettlement(pendingGrossKrw, commissionRate);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller/settlements</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        매출·수수료·정산 내역
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        전부 샌드박스 모의 정산입니다. 현재 중개수수료율은 {(commissionRate * 100).toFixed(1)}%
        입니다(운영자가 변경 가능).
      </p>

      <div className="mt-5 rounded-lg border border-brand-green/15 bg-white p-4 text-sm">
        <p className="text-xs text-brand-deepgreen/50">정산대기금액</p>
        <p className="mt-1 text-lg font-semibold text-brand-deepgreen">
          {formatKRW(pending.grossKrw)}
        </p>
        <p className="mt-1 text-xs text-brand-deepgreen/60">
          수수료 예상 {formatKRW(pending.commissionKrw)} · 예상 정산액{" "}
          {formatKRW(pending.payoutKrw)}
        </p>
        <p className="mt-1 text-[11px] text-brand-deepgreen/40">
          배송완료된 주문 중 운영자가 아직 정산 배치를 실행하지 않은 금액입니다.
        </p>
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        정산 내역
      </h2>
      {settlements.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          아직 생성된 정산 배치가 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {settlements.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-deepgreen/60">
                  {s.createdAt.toLocaleDateString("ko-KR")}
                </span>
                <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
              <p className="mt-1 font-medium text-brand-deepgreen">
                정산액 {formatKRW(s.payoutKrw)}
              </p>
              <p className="text-xs text-brand-deepgreen/50">
                GMV {formatKRW(s.grossKrw)} · 수수료 {formatKRW(s.commissionKrw)} (
                {(s.commissionRate * 100).toFixed(0)}%)
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
