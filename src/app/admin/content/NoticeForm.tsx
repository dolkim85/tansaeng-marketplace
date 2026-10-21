"use client";

import { useActionState } from "react";
import { createNoticeAction } from "@/server/content/actions";

export function NoticeForm() {
  const [state, formAction, pending] = useActionState(createNoticeAction, undefined);

  return (
    <form action={formAction} className="mt-3 space-y-2 rounded-lg border border-brand-deepgreen/15 bg-white p-4">
      <input
        name="title"
        required
        aria-label="제목"
        placeholder="제목"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <textarea
        name="body"
        required
        rows={3}
        aria-label="내용"
        placeholder="내용"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-xs text-brand-deepgreen/70">
        <input type="checkbox" name="isPinned" className="rounded" />
        상단 고정
      </label>
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
        {pending ? "등록 중..." : "공지 추가"}
      </button>
    </form>
  );
}
