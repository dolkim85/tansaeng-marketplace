import {
  getGlobalSettlementSummary,
  listSellersWithPendingSettlement,
  listAllSettlementsForAdmin,
} from "@/server/settlement/queries";
import { runSettlementAction, approveSettlementAction } from "@/server/settlement/actions";
import { calcSettlement } from "@/lib/settlement";
import { getCommissionRate } from "@/server/platformSettings/queries";
import { formatKRW } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "정산대기",
  APPROVED: "지급완료(모의)",
};

export default async function AdminSettlementsPage() {
  const [summary, pendingSellers, settlements, commissionRate] = await Promise.all([
    getGlobalSettlementSummary(),
    listSellersWithPendingSettlement(),
    listAllSettlementsForAdmin(),
    getCommissionRate(),
  ]);
  const { commissionKrw, payoutKrw } = calcSettlement(summary.totalGrossKrw, commissionRate);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/70">
        /admin/settlements
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        수수료·정산·대사
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        전부 샌드박스 모의 정산입니다(실제 지급/원천징수 없음). 현재 중개수수료율{" "}
        {(commissionRate * 100).toFixed(1)}%는{" "}
        <a href="/admin/settings" className="underline-offset-2 hover:underline">
          /admin/settings
        </a>
        에서 변경할 수 있습니다.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/70">거래완료액(GMV)</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {formatKRW(summary.totalGrossKrw)}
          </p>
        </div>
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/70">중개수수료(모의)</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {formatKRW(commissionKrw)}
          </p>
        </div>
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/70">판매자 정산액(모의)</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {formatKRW(payoutKrw)}
          </p>
        </div>
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/70">환불액</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {formatKRW(summary.totalRefundKrw)}
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-brand-deepgreen/15 bg-white/60 p-3">
          <p className="text-xs text-brand-deepgreen/70">광고매출</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen/70">
            모의 미집계
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        정산 대상 판매자
      </h2>
      {pendingSellers.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          배송완료되었으나 아직 정산 배치에 포함되지 않은 주문이 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {pendingSellers.map((s) => (
            <li
              key={s.sellerId}
              className="flex items-center justify-between rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-brand-deepgreen">{s.storeName}</p>
                <p className="text-xs text-brand-deepgreen/70">
                  정산대기금액 {formatKRW(s.pendingGrossKrw)}
                </p>
              </div>
              <form action={runSettlementAction.bind(null, s.sellerId)}>
                <button
                  type="submit"
                  className="rounded-md bg-brand-deepgreen px-3 py-1.5 text-xs font-semibold text-white"
                >
                  정산 실행
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        정산 배치 내역
      </h2>
      {settlements.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          생성된 정산 배치가 없습니다.
        </p>
      ) : (
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-deepgreen/15 text-xs text-brand-deepgreen/70">
              <th className="py-2">판매자</th>
              <th className="py-2">생성일</th>
              <th className="py-2">GMV</th>
              <th className="py-2">수수료</th>
              <th className="py-2">정산액</th>
              <th className="py-2">상태</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.id} className="border-b border-brand-deepgreen/5">
                <td className="py-2">{s.seller.storeName}</td>
                <td className="py-2 text-brand-deepgreen/70">
                  {s.createdAt.toLocaleDateString("ko-KR")}
                </td>
                <td className="py-2">{formatKRW(s.grossKrw)}</td>
                <td className="py-2">{formatKRW(s.commissionKrw)}</td>
                <td className="py-2">{formatKRW(s.payoutKrw)}</td>
                <td className="py-2">
                  <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                    {STATUS_LABEL[s.status]}
                  </span>
                </td>
                <td className="py-2">
                  {s.status === "PENDING" && (
                    <form action={approveSettlementAction.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="text-xs text-brand-green underline-offset-2 hover:underline"
                      >
                        승인
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
