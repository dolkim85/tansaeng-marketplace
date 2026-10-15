"use client";

import { useActionState } from "react";
import { joinGroupBuyAction } from "@/server/groupbuy/actions";

export function JoinForm({ groupBuyId }: { groupBuyId: string }) {
  const boundAction = joinGroupBuyAction.bind(null, groupBuyId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="mt-4 flex items-end gap-2">
      <div>
        <label htmlFor="quantity" className="block text-xs text-brand-deepgreen/70">
          수량
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          required
          className="mt-1 w-20 rounded-md border border-brand-green/20 px-2 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "참여 처리중..." : "참여하기 (Mock 결제 대기)"}
      </button>
      {state?.error && (
        <p role="alert" className="ml-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
