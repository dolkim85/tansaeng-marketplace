"use client";

import { useActionState } from "react";
import { updateSellerStoreAction } from "@/server/seller/actions";

export function SellerStoreForm({
  introduction,
  shippingPolicy,
  returnPolicy,
}: {
  introduction: string;
  shippingPolicy: string;
  returnPolicy: string;
}) {
  const [state, formAction, pending] = useActionState(updateSellerStoreAction, undefined);

  return (
    <form action={formAction} className="mt-5 max-w-xl space-y-4">
      <div>
        <label htmlFor="introduction" className="block text-sm text-brand-deepgreen/80">
          생산자 소개
        </label>
        <p className="mt-0.5 text-[11px] text-brand-deepgreen/50">
          생산자/농장 소개, 재배 방식, 인증 정보 등을 자유롭게 작성하세요. 비워두면 스토어
          페이지에 소개 섹션이 노출되지 않습니다.
        </p>
        <textarea
          id="introduction"
          name="introduction"
          rows={6}
          maxLength={3000}
          defaultValue={introduction}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="shippingPolicy" className="block text-sm text-brand-deepgreen/80">
          배송 정책
        </label>
        <textarea
          id="shippingPolicy"
          name="shippingPolicy"
          rows={4}
          maxLength={2000}
          placeholder="출고 주기, 배송비, 제주·도서산간 추가비용 등"
          defaultValue={shippingPolicy}
          className="mt-1 w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="returnPolicy" className="block text-sm text-brand-deepgreen/80">
          반품 정책
        </label>
        <p className="mt-0.5 text-[11px] text-brand-deepgreen/50">
          여기에 작성한 내용은 상품 상세페이지에도 함께 노출됩니다.
        </p>
        <textarea
          id="returnPolicy"
          name="returnPolicy"
          rows={4}
          maxLength={2000}
          placeholder="단순변심/하자/오배송/변질 등 유형별 반품·교환 가능 여부와 기한"
          defaultValue={returnPolicy}
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
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
