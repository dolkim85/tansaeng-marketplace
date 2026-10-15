"use client";

import { useActionState } from "react";
import { requestAdAction } from "@/server/ads/actions";

type Product = { id: string; title: string };

export function AdForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(
    requestAdAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-5 max-w-md space-y-3">
      <div>
        <label htmlFor="productId" className="block text-sm text-brand-deepgreen/80">
          광고할 상품
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
        <label htmlFor="placement" className="block text-sm text-brand-deepgreen/80">
          노출 위치
        </label>
        <select
          id="placement"
          name="placement"
          defaultValue="SEARCH"
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          <option value="SEARCH">검색 스폰서</option>
          <option value="CATEGORY_TOP">카테고리 상단</option>
          <option value="HOME_BANNER">홈 배너</option>
        </select>
      </div>
      <div>
        <label htmlFor="startAt" className="block text-sm text-brand-deepgreen/80">
          시작 시각
        </label>
        <input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="endAt" className="block text-sm text-brand-deepgreen/80">
          종료 시각
        </label>
        <input
          id="endAt"
          name="endAt"
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
        {pending ? "신청 중..." : "광고 신청(모의 과금)"}
      </button>
    </form>
  );
}
