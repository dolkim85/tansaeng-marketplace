"use client";

import { useActionState } from "react";
import { registerAction } from "@/server/auth/actions";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <div>
        <label htmlFor="name" className="block text-sm text-brand-deepgreen/80">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
        />
      </div>
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
          비밀번호 (8자 이상)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        {pending ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
