"use client";

import { useActionState } from "react";
import { updateCommissionRateAction } from "@/server/platformSettings/actions";

export function CommissionRateForm({ currentPercent }: { currentPercent: number }) {
  const [state, formAction, pending] = useActionState(updateCommissionRateAction, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
      <div>
        <label htmlFor="commissionPercent" className="block text-xs text-brand-deepgreen/70">
          중개수수료율(%)
        </label>
        <input
          id="commissionPercent"
          name="commissionPercent"
          type="number"
          min={0}
          max={100}
          step={0.1}
          defaultValue={currentPercent}
          required
          className="mt-1 w-28 rounded-md border border-brand-deepgreen/20 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-deepgreen px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
      {state?.error && (
        <span role="alert" className="w-full text-xs text-red-600">
          {state.error}
        </span>
      )}
    </form>
  );
}
