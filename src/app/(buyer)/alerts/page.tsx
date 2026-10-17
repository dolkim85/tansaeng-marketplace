import Link from "next/link";
import { getSession } from "@/server/session";
import { listMyGroupBuyAlerts } from "@/server/groupbuy/queries";
import { toggleGroupBuyAlertAction } from "@/server/groupbuy/actions";
import { getNotificationPreference } from "@/server/notifications/queries";
import { updateNotificationPreferenceAction } from "@/server/notifications/actions";
import { PHASE_LABEL } from "@/lib/groupBuyPhase";

export default async function AlertsPage() {
  const session = await getSession();
  const [alerts, preference] = session
    ? await Promise.all([
        listMyGroupBuyAlerts(session.sub),
        getNotificationPreference(session.sub),
      ])
    : [[], { marketingEmailOptIn: false, marketingPushOptIn: false }];

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/alerts</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        관심 알림·수신설정
      </h1>

      {!session ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          로그인 후 관심 알림과 수신설정을 확인할 수 있습니다.
        </p>
      ) : (
        <>
          <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
            공동구매 오픈 알림
          </h2>
          <p className="mt-1 text-xs text-brand-deepgreen/60">
            신청하신 알림은 수요 관심으로만 집계되며, 실제 결제 주문량에는 포함되지 않습니다.
          </p>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-brand-deepgreen/60">
              신청한 오픈 알림이 없습니다.{" "}
              <Link href="/upcoming" className="text-brand-green underline-offset-2 hover:underline">
                오픈예정 공동구매 보러가기 →
              </Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
                >
                  <div>
                    <Link
                      href={`/group-buys/${a.groupBuyId}`}
                      className="font-medium text-brand-deepgreen hover:text-brand-green"
                    >
                      {a.groupBuy.product.title}
                    </Link>
                    <p className="text-xs text-brand-deepgreen/50">
                      {PHASE_LABEL[a.groupBuy.phase]} · 오픈{" "}
                      {a.groupBuy.openAt.toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <form action={toggleGroupBuyAlertAction.bind(null, a.groupBuyId)}>
                    <button
                      type="submit"
                      className="text-xs text-red-600 underline-offset-2 hover:underline"
                    >
                      알림 해제
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
            수신설정
          </h2>
          <p className="mt-1 rounded-md bg-brand-green/5 p-3 text-xs text-brand-deepgreen/70">
            주문·배송·결제·분쟁 등 거래 관련 알림은 서비스 이용에 필수이므로 끌 수 없습니다.
            아래는 광고성 정보(할인/이벤트 등) 수신 동의만 채널별로 설정합니다.
          </p>
          <form action={updateNotificationPreferenceAction} className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-brand-deepgreen">
              <input
                type="checkbox"
                name="marketingEmailOptIn"
                defaultChecked={preference.marketingEmailOptIn}
                className="rounded"
              />
              이메일로 광고성 정보 받기
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-deepgreen">
              <input
                type="checkbox"
                name="marketingPushOptIn"
                defaultChecked={preference.marketingPushOptIn}
                className="rounded"
              />
              푸시 알림으로 광고성 정보 받기
            </label>
            <button
              type="submit"
              className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
            >
              저장
            </button>
          </form>
        </>
      )}
    </section>
  );
}
