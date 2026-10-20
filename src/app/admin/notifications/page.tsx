import {
  listNotificationLogsForAdmin,
  getConsentSummary,
} from "@/server/notifications/adminQueries";
import { listScheduledGroupBuyAlertCounts } from "@/server/groupbuy/queries";
import { NOTIFICATION_TYPE_LABEL } from "@/lib/notificationLabels";
import { safeRatePercent } from "@/lib/analytics";

export default async function AdminNotificationsPage() {
  const [logs, consent, scheduled] = await Promise.all([
    listNotificationLogsForAdmin(),
    getConsentSummary(),
    listScheduledGroupBuyAlertCounts(),
  ]);

  const emailRate = safeRatePercent(consent.emailOptIn, consent.totalUsers);
  const pushRate = safeRatePercent(consent.pushOptIn, consent.totalUsers);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">
        /admin/notifications
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        알림 예약/발송 로그/동의 현황
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        실제 이메일/푸시 발송은 일어나지 않습니다(NOTIFICATION_PROVIDER=mock). 아래는
        &quot;실제 서비스였다면 이 시점에 발송되었을 것&quot;이라는 기록과 현황입니다.
      </p>

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
        수신동의 현황
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/50">전체 회원</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {consent.totalUsers}명
          </p>
        </div>
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/50">이메일 광고 수신동의</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {consent.emailOptIn}명 ({emailRate}%)
          </p>
        </div>
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <p className="text-xs text-brand-deepgreen/50">푸시 광고 수신동의</p>
          <p className="mt-1 text-sm font-semibold text-brand-deepgreen">
            {consent.pushOptIn}명 ({pushRate}%)
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        예약된 알림 (공동구매 오픈 알림)
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        오픈예정 공동구매에 신청된 알림 건수입니다. 공동구매 오픈은 스케줄러 없이 요청
        시점에 계산되므로, 오픈 순간 자동 발송은 아직 구현되어 있지 않습니다.
      </p>
      {scheduled.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          오픈예정 공동구매가 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {scheduled.map((s) => (
            <li
              key={s.groupBuyId}
              className="flex items-center justify-between rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-brand-deepgreen">
                  {s.title} <span className="text-brand-deepgreen/50">({s.productTitle})</span>
                </p>
                <p className="text-xs text-brand-deepgreen/50">
                  오픈 예정 {s.openAt.toLocaleString("ko-KR")}
                </p>
              </div>
              <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                알림 신청 {s.alertCount}건
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        발송 로그 (모의)
      </h2>
      {logs.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          기록된 알림 발송 로그가 없습니다.
        </p>
      ) : (
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-deepgreen/15 text-xs text-brand-deepgreen/50">
              <th className="py-2">시각</th>
              <th className="py-2">수신자</th>
              <th className="py-2">종류</th>
              <th className="py-2">제목</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-brand-deepgreen/5">
                <td className="py-2 text-xs text-brand-deepgreen/60">
                  {log.createdAt.toLocaleString("ko-KR")}
                </td>
                <td className="py-2">{log.user.name}</td>
                <td className="py-2">
                  {NOTIFICATION_TYPE_LABEL[log.type] ?? log.type}
                </td>
                <td className="py-2 text-brand-deepgreen/70">{log.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
