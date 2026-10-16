"use client";

import { useActionState } from "react";
import { createProxyProductAction } from "@/server/admin/actions";

type Seller = { id: string; storeName: string; userName: string; applicationStatus: string };
type Category = { id: string; name: string };

export function ProxyProductForm({
  sellers,
  categories,
}: {
  sellers: Seller[];
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(createProxyProductAction, undefined);

  return (
    <form action={formAction} className="mt-5 max-w-md space-y-3">
      <div>
        <label htmlFor="sellerId" className="block text-sm text-brand-deepgreen/80">
          대상 농가(판매자)
        </label>
        <select
          id="sellerId"
          name="sellerId"
          required
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        >
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.storeName} ({s.userName}) · {s.applicationStatus}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm text-brand-deepgreen/80">
          상품명
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
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
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="originRegion" className="block text-sm text-brand-deepgreen/80">
          원산지
        </label>
        <input
          id="originRegion"
          name="originRegion"
          required
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="priceKrw" className="block text-sm text-brand-deepgreen/80">
          가격(원)
        </label>
        <input
          id="priceKrw"
          name="priceKrw"
          type="number"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="stockQty" className="block text-sm text-brand-deepgreen/80">
          재고
        </label>
        <input
          id="stockQty"
          name="stockQty"
          type="number"
          min={0}
          defaultValue={0}
          required
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-brand-deepgreen/80">
          상세 설명 (선택)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="proxySourceNote" className="block text-sm text-brand-deepgreen/80">
          상품 정보 출처(전달 경로)
        </label>
        <input
          id="proxySourceNote"
          name="proxySourceNote"
          required
          placeholder="예: 전화 통화로 전달받음, 카카오톡으로 사진/가격 전달받음"
          className="mt-1 w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-brand-deepgreen/70">
        <input type="checkbox" name="consentConfirmed" required className="mt-0.5 rounded" />
        위 농가로부터 상품 정보를 대신 등록하는 것에 대한 사전 동의를 확인했습니다.
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-deepgreen px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "등록 중..." : "대리등록 (임시저장, 승인 전까지 비공개)"}
      </button>
    </form>
  );
}
