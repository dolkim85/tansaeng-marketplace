"use client";

import { useActionState } from "react";
import { createBannerAction } from "@/server/content/actions";

export function BannerForm() {
  const [state, formAction, pending] = useActionState(createBannerAction, undefined);

  return (
    <form action={formAction} className="mt-3 space-y-2 rounded-lg border border-brand-deepgreen/15 bg-white p-4">
      <input
        name="title"
        required
        placeholder="제목"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <input
        name="subtitle"
        placeholder="부제목 (선택)"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <input
        name="linkUrl"
        placeholder="연결 링크 (선택, 예: /group-buys)"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <input
        name="sortOrder"
        type="number"
        defaultValue={0}
        placeholder="우선순위 (낮을수록 먼저 노출)"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-deepgreen px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "등록 중..." : "배너 추가"}
      </button>
    </form>
  );
}
