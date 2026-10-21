"use client";

import { useActionState } from "react";
import { updateProductAction } from "@/server/seller/actions";

type Category = { id: string; name: string };

type Product = {
  title: string;
  categoryId: string;
  priceKrw: number;
  stockQty: number;
  originRegion: string;
  description: string | null;
};

export function EditBasicInfoForm({
  productId,
  product,
  categories,
}: {
  productId: string;
  product: Product;
  categories: Category[];
}) {
  const boundAction = updateProductAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="mt-3 max-w-md space-y-3">
      <div>
        <label htmlFor="title" className="block text-sm text-brand-deepgreen/80">
          상품명
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={product.title}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm text-brand-deepgreen/80">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={product.categoryId}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-brand-deepgreen/70">
          판매 허가를 받은 카테고리만 선택할 수 있습니다.
        </p>
      </div>
      <div>
        <label htmlFor="originRegion" className="block text-sm text-brand-deepgreen/80">
          원산지/생산지
        </label>
        <input
          id="originRegion"
          name="originRegion"
          required
          defaultValue={product.originRegion}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="priceKrw" className="block text-sm text-brand-deepgreen/80">
            가격(원)
          </label>
          <input
            id="priceKrw"
            name="priceKrw"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={product.priceKrw}
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="stockQty" className="block text-sm text-brand-deepgreen/80">
            재고 수량
          </label>
          <input
            id="stockQty"
            name="stockQty"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={product.stockQty}
            className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-brand-deepgreen/80">
          상세 설명 (선택, 블록이 있으면 공개 페이지에는 노출되지 않음)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product.description ?? ""}
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
        {pending ? "저장 중..." : "기본 정보 저장"}
      </button>
    </form>
  );
}
