"use client";

import { useActionState } from "react";
import { replyTicketAction } from "@/server/support/actions";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const boundAction = replyTicketAction.bind(null, ticketId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <textarea
        name="body"
        required
        rows={3}
        aria-label="답변 내용"
        placeholder="답변/추가 메시지를 입력하세요."
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
        {pending ? "전송 중..." : "답변 등록"}
      </button>
    </form>
  );
}
