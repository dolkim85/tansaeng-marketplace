"use client";

import { useActionState } from "react";
import { createProductAction } from "@/server/seller/actions";

type Category = { id: string; name: string };

export function ProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-5 max-w-md space-y-3">
      <div>
        <label htmlFor="title" className="block text-sm text-brand-deepgreen/80">
          상품명
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm text-brand-deepgreen/80"
        >
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="originRegion"
          className="block text-sm text-brand-deepgreen/80"
        >
          원산지/생산지
        </label>
        <input
          id="originRegion"
          name="originRegion"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label
            htmlFor="priceKrw"
            className="block text-sm text-brand-deepgreen/80"
          >
            가격(원)
          </label>
          <input
            id="priceKrw"
            name="priceKrw"
            type="number"
            min={0}
            step={1}
            required
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="stockQty"
            className="block text-sm text-brand-deepgreen/80"
          >
            재고 수량
          </label>
          <input
            id="stockQty"
            name="stockQty"
            type="number"
            min={0}
            step={1}
            required
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm text-brand-deepgreen/80"
        >
          상세 설명 (선택)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
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
        {pending ? "등록 중..." : "상품 등록"}
      </button>
      <p className="text-xs text-brand-deepgreen/50">
        사진/영상은 상품 등록 후 수정 페이지에서 추가할 수 있습니다.
      </p>
    </form>
  );
}
