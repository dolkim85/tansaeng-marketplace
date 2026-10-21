"use client";

import { useActionState } from "react";
import { createOrderTicketAction } from "@/server/support/actions";

export function NewOrderTicketForm({
  orderId,
  items,
}: {
  orderId: string;
  items: { id: string; titleSnapshot: string; sellerName: string }[];
}) {
  const boundAction = createOrderTicketAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-2 rounded-lg border border-brand-green/20 bg-white p-4"
    >
      <p className="text-sm font-semibold text-brand-deepgreen">
        주문 문의/분쟁 접수
      </p>
      <select
        name="category"
        aria-label="문의 유형"
        defaultValue="ORDER_INQUIRY"
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      >
        <option value="ORDER_INQUIRY">주문 문의</option>
        <option value="DISPUTE">분쟁(하자/오배송/변질/환불 등)</option>
      </select>
      <select
        name="orderItemId"
        aria-label="문의할 상품"
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      >
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.titleSnapshot} ({item.sellerName})
          </option>
        ))}
      </select>
      <input
        name="subject"
        required
        aria-label="제목"
        placeholder="제목"
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      />
      <textarea
        name="body"
        required
        rows={3}
        aria-label="내용"
        placeholder="내용을 입력하세요."
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
        {pending ? "접수 중..." : "접수"}
      </button>
    </form>
  );
}
