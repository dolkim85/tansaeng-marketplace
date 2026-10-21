"use client";

import { useActionState } from "react";
import { verifyMfaAction, cancelMfaAction } from "@/server/auth/actions";

export function MfaForm() {
  const [state, formAction, pending] = useActionState(verifyMfaAction, undefined);

  return (
    <div className="mt-5 space-y-3">
      <form action={formAction} className="space-y-3">
        <div>
          <label htmlFor="code" className="block text-sm text-brand-deepgreen/80">
            인증번호 / 복구 코드
          </label>
          <input
            id="code"
            name="code"
            required
            autoComplete="one-time-code"
            autoFocus
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-green/40"
          />
        </div>
        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "확인 중..." : "확인"}
        </button>
      </form>
      <form action={cancelMfaAction}>
        <button
          type="submit"
          className="w-full text-xs text-brand-deepgreen/70 underline-offset-2 hover:underline"
        >
          취소하고 다시 로그인
        </button>
      </form>
    </div>
  );
}
