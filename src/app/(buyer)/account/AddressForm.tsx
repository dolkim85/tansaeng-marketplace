"use client";

import { useActionState } from "react";
import { createAddressAction } from "@/server/account/actions";

export function AddressForm({ hasAddresses }: { hasAddresses: boolean }) {
  const [state, formAction, pending] = useActionState(createAddressAction, undefined);

  return (
    <form action={formAction} className="mt-3 max-w-sm space-y-2 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-3">
      <div>
        <label htmlFor="label" className="block text-xs text-brand-deepgreen/60">
          별칭 (선택, 예: 집/회사)
        </label>
        <input
          id="label"
          name="label"
          maxLength={20}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="recipientName" className="block text-xs text-brand-deepgreen/60">
          받는 분
        </label>
        <input
          id="recipientName"
          name="recipientName"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="recipientPhone" className="block text-xs text-brand-deepgreen/60">
          연락처
        </label>
        <input
          id="recipientPhone"
          name="recipientPhone"
          required
          placeholder="010-0000-0000"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="addressLine" className="block text-xs text-brand-deepgreen/60">
          배송지 주소
        </label>
        <textarea
          id="addressLine"
          name="addressLine"
          required
          rows={2}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-1.5 text-sm"
        />
      </div>
      {hasAddresses && (
        <label className="flex items-center gap-1.5 text-xs text-brand-deepgreen/70">
          <input type="checkbox" name="isDefault" />
          기본 배송지로 설정
        </label>
      )}
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-xs text-brand-green">{state.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "등록 중..." : "배송지 추가"}
      </button>
    </form>
  );
}
