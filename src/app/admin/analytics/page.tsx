import { getAdminAnalyticsSummary } from "@/server/analytics/queries";
import { formatKRW } from "@/lib/currency";

export default async function AdminAnalyticsPage() {
  const s = await getAdminAnalyticsSummary();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">
        /admin/analytics
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        거래액·활성회원·전환율
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        전부 실제 DB 데이터 기준 집계입니다(샌드박스 데이터). 광고/정산 금액은 실제 과금이
        아닌 모의 데이터입니다.
      </p>

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">거래 지표</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="결제완료 거래액(GMV)" value={formatKRW(s.gmvKrw)} />
        <StatCard label="전체 주문 수" value={`${s.totalOrders}건`} />
        <StatCard label="취소율" value={`${s.cancelRatePercent}%`} />
        <StatCard label="평균 결제금액" value={formatKRW(s.avgOrderKrw)} />
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">회원 지표</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="전체 구매자" value={`${s.totalBuyers}명`} />
        <StatCard label="활성 구매자(주문 1건 이상)" value={`${s.activeBuyers}명`} />
        <StatCard label="구매자 전환율" value={`${s.buyerConversionPercent}%`} />
        <StatCard label="전체 판매자" value={`${s.totalSellers}곳`} />
        <StatCard label="승인된 판매자" value={`${s.approvedSellers}곳`} />
        <StatCard label="판매자 승인율" value={`${s.sellerApprovalPercent}%`} />
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        공동구매·광고 지표
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="공동구매 성사율" value={`${s.groupBuySuccessPercent}%`} />
        <StatCard label="광고 노출수" value={`${s.adImpressions}회`} />
        <StatCard label="광고 클릭수" value={`${s.adClicks}회`} />
        <StatCard label="광고 CTR" value={`${s.adCtrPercent}%`} />
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        최근 7일 추이
      </h2>
      <table className="mt-2 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-deepgreen/15 text-xs text-brand-deepgreen/50">
            <th className="py-2">날짜</th>
            <th className="py-2">신규 가입자</th>
            <th className="py-2">신규 주문</th>
          </tr>
        </thead>
        <tbody>
          {s.signupTrend.map((signup, i) => (
            <tr key={signup.date} className="border-b border-brand-deepgreen/5">
              <td className="py-2 text-brand-deepgreen/60">{signup.date}</td>
              <td className="py-2">{signup.count}명</td>
              <td className="py-2">{s.orderTrend[i]?.count ?? 0}건</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
      <p className="text-xs text-brand-deepgreen/50">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-deepgreen">{value}</p>
    </div>
  );
}
