"use client";

import { useActionState } from "react";
import { checkoutAction } from "@/server/orders/actions";

export function CheckoutForm() {
  const [state, formAction, pending] = useActionState(checkoutAction, undefined);

  return (
    <form action={formAction} className="mt-5 max-w-sm space-y-3">
      <div>
        <label
          htmlFor="recipientName"
          className="block text-sm text-brand-deepgreen/80"
        >
          받는 분
        </label>
        <input
          id="recipientName"
          name="recipientName"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="recipientPhone"
          className="block text-sm text-brand-deepgreen/80"
        >
          연락처
        </label>
        <input
          id="recipientPhone"
          name="recipientPhone"
          required
          placeholder="010-0000-0000"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="addressLine"
          className="block text-sm text-brand-deepgreen/80"
        >
          배송지 주소
        </label>
        <textarea
          id="addressLine"
          name="addressLine"
          required
          rows={2}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "주문 생성 중..." : "주문 생성 (Mock 결제 대기)"}
      </button>
    </form>
  );
}
