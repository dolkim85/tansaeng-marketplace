"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <div>
        <label htmlFor="email" className="block text-sm text-brand-deepgreen/80">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm text-brand-deepgreen/80"
        >
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
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
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
