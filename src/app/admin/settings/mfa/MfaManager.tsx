"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import {
  startMfaEnrollmentAction,
  confirmMfaEnrollmentAction,
  disableMfaAction,
  regenerateRecoveryCodesAction,
  cancelMfaEnrollmentAction,
} from "@/server/mfa/actions";

type Phase = "idle" | "pending" | "enabled";

export function MfaManager({
  initialEnabled,
  initialEnrollmentPending,
  initialRemainingRecoveryCodes,
  pendingSecret,
  pendingQrDataUrl,
}: {
  initialEnabled: boolean;
  initialEnrollmentPending: boolean;
  initialRemainingRecoveryCodes: number;
  pendingSecret?: string;
  pendingQrDataUrl?: string;
}) {
  // 최초 마운트 시점에만 시드되고(lazy initializer), 이후 부모 서버 컴포넌트가
  // confirm/disable 액션 이후 자동으로 새로고침되어 fresh한 initial*을 다시
  // 내려줘도 이 값은 갱신되지 않는다 — 전이는 오직 아래 useActionState 결과로만
  // 파생시킨다(이펙트에서 setState하지 않고 렌더 중 직접 계산). 그래야 "복구
  // 코드를 한 번만 보여주기" 같은 화면이 중간에 사라지지 않는다.
  const [seedPhase] = useState<Phase>(
    initialEnabled ? "enabled" : initialEnrollmentPending ? "pending" : "idle"
  );

  const [confirmState, confirmFormAction, confirmPending] = useActionState(
    confirmMfaEnrollmentAction,
    undefined
  );
  const [disableState, disableFormAction, disablePending] = useActionState(
    disableMfaAction,
    undefined
  );
  const [regenState, regenFormAction, regenPending] = useActionState(
    regenerateRecoveryCodesAction,
    undefined
  );

  const phase: Phase = confirmState?.success ? "enabled" : seedPhase;

  const recoveryCodes: string[] | null =
    confirmState?.success && confirmState.recoveryCodes
      ? confirmState.recoveryCodes
      : regenState?.success && regenState.recoveryCodes
        ? regenState.recoveryCodes
        : null;

  const remainingRecoveryCodes =
    confirmState?.success && confirmState.recoveryCodes
      ? confirmState.recoveryCodes.length
      : regenState?.success && regenState.recoveryCodes
        ? regenState.recoveryCodes.length
        : initialRemainingRecoveryCodes;

  if (phase === "idle") {
    return (
      <div>
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          계정 탈취 위험을 줄이기 위해 로그인 시 비밀번호 외에 인증 앱의 6자리
          코드를 한 번 더 확인합니다(선택 사항).
        </p>
        <form action={startMfaEnrollmentAction} className="mt-4">
          <button
            type="submit"
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white"
          >
            2단계 인증 설정 시작
          </button>
        </form>
      </div>
    );
  }

  if (phase === "pending") {
    return (
      <div>
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          Google Authenticator 등 인증 앱으로 아래 QR 코드를 스캔하거나, 수동
          입력 키를 직접 입력하세요.
        </p>

        {pendingQrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- 서버에서 생성한 data: URL, next/image 최적화 대상 아님
          <img
            src={pendingQrDataUrl}
            alt="2단계 인증 설정용 QR 코드"
            width={220}
            height={220}
            className="mt-4 rounded-lg border border-brand-green/15 bg-white p-3"
          />
        )}

        {pendingSecret && (
          <p className="mt-3 text-xs text-brand-deepgreen/70">
            수동 입력 키:{" "}
            <code className="rounded bg-brand-green/10 px-1.5 py-0.5 font-mono text-brand-deepgreen">
              {pendingSecret}
            </code>
          </p>
        )}

        <h2 className="mt-6 text-sm font-semibold text-brand-deepgreen">
          앱에 표시된 6자리 코드 입력
        </h2>
        <form action={confirmFormAction} className="mt-2 flex items-center gap-2">
          <input
            name="code"
            required
            autoComplete="one-time-code"
            placeholder="6자리 코드"
            className="w-32 rounded-md border border-brand-green/20 px-3 py-2 text-sm tracking-widest"
          />
          <button
            type="submit"
            disabled={confirmPending}
            className="rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {confirmPending ? "확인 중..." : "확인하고 활성화"}
          </button>
        </form>
        {confirmState?.error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {confirmState.error}
          </p>
        )}

        <form action={cancelMfaEnrollmentAction} className="mt-3">
          <button
            type="submit"
            className="text-xs text-brand-deepgreen/70 underline-offset-2 hover:underline"
          >
            설정 취소
          </button>
        </form>
      </div>
    );
  }

  // phase === "enabled"
  return (
    <div>
      <p className="mt-2 rounded-md bg-brand-green/10 p-3 text-sm text-brand-green">
        2단계 인증이 활성화되어 있습니다. 남은 복구 코드 {remainingRecoveryCodes}개.
      </p>

      {recoveryCodes && (
        <div className="mt-3 rounded-md border border-brand-orange/40 bg-brand-orange/5 p-3">
          <p className="text-xs font-semibold text-brand-orange">
            복구 코드(이 화면을 벗어나면 다시 볼 수 없습니다 — 안전한 곳에 보관하세요)
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-1 font-mono text-sm text-brand-deepgreen">
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <Link
            href="/admin/settings"
            className="mt-3 inline-block rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white"
          >
            저장했습니다, 설정으로 돌아가기
          </Link>
        </div>
      )}

      <h2 className="mt-6 text-sm font-semibold text-brand-deepgreen">
        복구 코드 재발급
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        재발급하면 기존 복구 코드는 모두 무효화됩니다.
      </p>
      <form action={regenFormAction} className="mt-2 flex items-center gap-2">
        <input
          name="code"
          required
          autoComplete="one-time-code"
          placeholder="6자리 코드 또는 복구 코드"
          className="w-44 rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={regenPending}
          className="rounded-md border border-brand-green/30 px-3 py-2 text-sm font-semibold text-brand-deepgreen hover:bg-brand-green/10 disabled:opacity-60"
        >
          {regenPending ? "처리 중..." : "재발급"}
        </button>
      </form>
      {regenState?.error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {regenState.error}
        </p>
      )}

      <h2 className="mt-8 text-sm font-semibold text-brand-deepgreen">
        2단계 인증 비활성화
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        현재 인증 앱의 코드(또는 복구 코드)를 입력해야 비활성화할 수 있습니다.
      </p>
      <form action={disableFormAction} className="mt-2 flex items-center gap-2">
        <input
          name="code"
          required
          autoComplete="one-time-code"
          placeholder="6자리 코드 또는 복구 코드"
          className="w-44 rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={disablePending}
          className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {disablePending ? "처리 중..." : "비활성화"}
        </button>
      </form>
      {disableState?.error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {disableState.error}
        </p>
      )}
    </div>
  );
}
