"use client";

import { useActionState } from "react";
import { submitSellerApplicationAction } from "@/server/seller/actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    submitSellerApplicationAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-5 max-w-sm space-y-3">
      <div>
        <label
          htmlFor="storeName"
          className="block text-sm text-brand-deepgreen/80"
        >
          농장/스토어 이름
        </label>
        <input
          id="storeName"
          name="storeName"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="identityType"
          className="block text-sm text-brand-deepgreen/80"
        >
          생산자 유형
        </label>
        <select
          id="identityType"
          name="identityType"
          defaultValue="FARM_ENTITY_ONLY"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          <option value="BUSINESS_PRODUCER">사업자등록 보유 생산자</option>
          <option value="FARM_ENTITY_ONLY">농업경영체등록만 보유</option>
        </select>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "제출 중..." : "입점 심사 신청"}
      </button>
    </form>
  );
}
