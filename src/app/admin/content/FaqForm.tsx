"use client";

import { useActionState } from "react";
import { createFaqAction } from "@/server/content/actions";

export function FaqForm() {
  const [state, formAction, pending] = useActionState(createFaqAction, undefined);

  return (
    <form action={formAction} className="mt-3 space-y-2 rounded-lg border border-brand-deepgreen/15 bg-white p-4">
      <input
        name="question"
        required
        placeholder="질문"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <textarea
        name="answer"
        required
        rows={2}
        placeholder="답변"
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      <input
        name="sortOrder"
        type="number"
        defaultValue={0}
        placeholder="순서 (낮을수록 먼저 노출)"
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
        {pending ? "등록 중..." : "FAQ 추가"}
      </button>
    </form>
  );
}
