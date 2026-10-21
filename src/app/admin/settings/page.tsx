import Link from "next/link";
import { getPlatformSettings } from "@/server/platformSettings/queries";
import { listPolicyVersions } from "@/server/policyVersions/queries";
import { getSession } from "@/server/session";
import { getMfaStatus } from "@/server/mfa/queries";
import { CommissionRateForm } from "./CommissionRateForm";
import { PolicyVersionForm } from "./PolicyVersionForm";

const OPERATIONAL_FLAGS = [
  { key: "APP_ENV", label: "앱 환경", value: process.env.APP_ENV ?? "local" },
  {
    key: "DIRECT_SALE_ENABLED",
    label: "탄생 직접판매형",
    value: process.env.DIRECT_SALE_ENABLED ?? "false",
  },
  {
    key: "PAYMENT_PROVIDER",
    label: "결제 공급자",
    value: process.env.PAYMENT_PROVIDER ?? "mock",
  },
  {
    key: "NOTIFICATION_PROVIDER",
    label: "알림 발송 공급자",
    value: process.env.NOTIFICATION_PROVIDER ?? "mock",
  },
] as const;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ mfaDisabled?: string }>;
}) {
  const session = await getSession();
  const { mfaDisabled } = await searchParams;
  const [settings, policyVersions, mfaStatus] = await Promise.all([
    getPlatformSettings(),
    listPolicyVersions(),
    session ? getMfaStatus(session.sub) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/70">/admin/settings</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        수수료·약관·운영설정
      </h1>

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
        중개수수료율
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        현재 {(settings.commissionRate * 100).toFixed(1)}%. 변경 시 이후 생성되는 정산
        배치부터 적용되며, 이미 생성된 배치의 수수료율은 바뀌지 않습니다(마스터 문서
        11.1절 — 확정 요율이 아닌 운영자 설정값).
      </p>
      <CommissionRateForm currentPercent={settings.commissionRate * 100} />

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        약관 버전
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        등록된 버전은 수정·삭제할 수 없습니다(법적 성격의 이력이라 과거 버전이 그대로
        보존되어야 함). 실제 구매자 동의 기록·연동은 범위 밖입니다.
      </p>
      {policyVersions.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          등록된 약관 버전이 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {policyVersions.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {p.title} <span className="text-brand-deepgreen/70">v{p.version}</span>
                </span>
                <span className="text-xs text-brand-deepgreen/70">
                  {p.createdAt.toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-xs text-brand-deepgreen/70">
                {p.content}
              </p>
            </li>
          ))}
        </ul>
      )}
      <PolicyVersionForm />

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        내 계정 보안 (2단계 인증)
      </h2>
      {mfaDisabled === "1" && (
        <p className="mt-1 rounded-md bg-brand-deepgreen/10 p-3 text-sm text-brand-deepgreen">
          2단계 인증을 비활성화했습니다.
        </p>
      )}
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        계정 탈취 위험을 줄이기 위해 로그인 시 인증 앱의 6자리 코드를 한 번 더
        확인하도록 설정할 수 있습니다(선택 사항, 마스터 문서 16장 &quot;admin MFA&quot;).
      </p>
      <p className="mt-2 text-sm">
        상태:{" "}
        <span
          className={
            mfaStatus?.enabled
              ? "font-semibold text-brand-green"
              : "font-semibold text-brand-deepgreen/70"
          }
        >
          {mfaStatus?.enabled ? "사용 중" : "사용 안 함"}
        </span>{" "}
        <Link
          href="/admin/settings/mfa"
          className="ml-2 text-brand-green underline-offset-2 hover:underline"
        >
          {mfaStatus?.enabled ? "관리" : "설정하기"} →
        </Link>
      </p>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        운영설정 (읽기 전용)
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        실결제·실발송 등 안전 관련 플래그는 사고 방지를 위해 이 화면에서 변경할 수
        없습니다. 서버 환경변수(`.env.local`)를 통해서만 바뀌며, 바꾸려면 사용자의
        명시적 승인이 필요합니다(docs/RELEASE_CHECKLIST.md 참고).
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {OPERATIONAL_FLAGS.map((flag) => (
          <div
            key={flag.key}
            className="rounded-lg border border-dashed border-brand-deepgreen/20 bg-white/60 p-3"
          >
            <dt className="text-xs text-brand-deepgreen/70">{flag.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-brand-deepgreen">
              {flag.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
