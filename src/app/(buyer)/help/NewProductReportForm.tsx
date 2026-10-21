"use client";

import { useActionState } from "react";
import { createProductReportAction } from "@/server/support/actions";

export function NewProductReportForm({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const boundAction = createProductReportAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-2 rounded-lg border border-red-200 bg-red-50/40 p-4"
    >
      <p className="text-sm font-semibold text-brand-deepgreen">
        상품 신고: {productTitle}
      </p>
      <p className="text-xs text-brand-deepgreen/70">
        신고 내용은 공개되지 않으며 관리자만 확인합니다.
      </p>
      <input
        name="subject"
        required
        aria-label="신고 사유"
        placeholder="신고 사유 (예: 허위정보, 부적합 콘텐츠, 금지품목 등)"
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      />
      <textarea
        name="body"
        required
        rows={3}
        aria-label="상세 내용"
        placeholder="상세 내용을 입력하세요."
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
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "신고 등록 중..." : "신고하기"}
      </button>
    </form>
  );
}
