"use client";

import { useActionState } from "react";
import { replyToReviewAction } from "@/server/reviews/actions";

export function ReplyForm({
  reviewId,
  currentReply,
}: {
  reviewId: string;
  currentReply: string | null;
}) {
  const boundAction = replyToReviewAction.bind(null, reviewId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="mt-2 space-y-1.5">
      <textarea
        name="reply"
        rows={2}
        defaultValue={currentReply ?? ""}
        aria-label="판매자 답변"
        placeholder="구매자 후기에 답변을 남겨보세요."
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-xs"
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
        {pending ? "저장 중..." : currentReply ? "답변 수정" : "답변 등록"}
      </button>
    </form>
  );
}
