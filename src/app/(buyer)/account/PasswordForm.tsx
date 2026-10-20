"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/server/account/actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="mt-3 max-w-sm space-y-2">
      <div>
        <label htmlFor="currentPassword" className="block text-xs text-brand-deepgreen/60">
          현재 비밀번호
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-xs text-brand-deepgreen/60">
          새 비밀번호 (8자 이상)
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-xs text-brand-deepgreen/60">
          새 비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-xs text-brand-green">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-brand-green/30 px-3 py-1.5 text-xs font-semibold text-brand-deepgreen hover:bg-brand-green/10 disabled:opacity-60"
      >
        {pending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
