"use client";

import { useActionState } from "react";
import { createGroupBuyAction } from "@/server/groupbuy/actions";

type Product = { id: string; title: string; priceKrw: number };

export function GroupBuyForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(
    createGroupBuyAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-5 max-w-md space-y-3">
      <div>
        <label htmlFor="productId" className="block text-sm text-brand-deepgreen/80">
          대상 상품
        </label>
        <select
          id="productId"
          name="productId"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm text-brand-deepgreen/80">
          공동구매 제목
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="예: 햇양파 5kg 공동구매"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="priceKrw" className="block text-sm text-brand-deepgreen/80">
          공동구매 확정가(원)
        </label>
        <input
          id="priceKrw"
          name="priceKrw"
          type="number"
          min={0}
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="targetQty" className="block text-sm text-brand-deepgreen/80">
            목표 수량
          </label>
          <input
            id="targetQty"
            name="targetQty"
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="maxQty" className="block text-sm text-brand-deepgreen/80">
            최대 공급 수량
          </label>
          <input
            id="maxQty"
            name="maxQty"
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="perUserLimit"
            className="block text-sm text-brand-deepgreen/80"
          >
            1인당 제한(0=없음)
          </label>
          <input
            id="perUserLimit"
            name="perUserLimit"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="teaserStartAt" className="block text-sm text-brand-deepgreen/80">
          티저 시작
        </label>
        <input
          id="teaserStartAt"
          name="teaserStartAt"
          type="datetime-local"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="openAt" className="block text-sm text-brand-deepgreen/80">
          오픈 시각
        </label>
        <input
          id="openAt"
          name="openAt"
          type="datetime-local"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="closeAt" className="block text-sm text-brand-deepgreen/80">
          마감 시각
        </label>
        <input
          id="closeAt"
          name="closeAt"
          type="datetime-local"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="expectedShipAt"
          className="block text-sm text-brand-deepgreen/80"
        >
          예상 출고일
        </label>
        <input
          id="expectedShipAt"
          name="expectedShipAt"
          type="datetime-local"
          required
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
        className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "등록 중..." : "공동구매 등록"}
      </button>
    </form>
  );
}
