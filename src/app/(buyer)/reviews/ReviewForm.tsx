"use client";

import { useActionState } from "react";
import { createReviewAction } from "@/server/reviews/actions";

export function ReviewForm({ orderItemId }: { orderItemId: string }) {
  const boundAction = createReviewAction.bind(null, orderItemId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-md bg-brand-green/5 p-3">
      <div className="flex items-center gap-2">
        <label htmlFor={`rating-${orderItemId}`} className="text-xs text-brand-deepgreen/70">
          별점
        </label>
        <select
          id={`rating-${orderItemId}`}
          name="rating"
          defaultValue="5"
          className="rounded-md border border-brand-green/20 px-2 py-1 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}점
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="comment"
        required
        rows={2}
        placeholder="상품은 어떠셨나요?"
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      />
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "등록 중..." : "후기 등록"}
      </button>
    </form>
  );
}
