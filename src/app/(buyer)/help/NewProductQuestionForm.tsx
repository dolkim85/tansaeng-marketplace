"use client";

import { useActionState } from "react";
import { createProductQuestionAction } from "@/server/support/actions";

export function NewProductQuestionForm({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const boundAction = createProductQuestionAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-2 rounded-lg border border-brand-green/20 bg-white p-4"
    >
      <p className="text-sm font-semibold text-brand-deepgreen">
        상품 문의: {productTitle}
      </p>
      <input
        name="subject"
        required
        placeholder="제목"
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      />
      <textarea
        name="body"
        required
        rows={3}
        placeholder="문의 내용을 입력하세요."
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-xs text-brand-deepgreen/70">
        <input type="checkbox" name="isPublic" className="rounded" />
        다른 구매자에게도 질문과 답변을 공개합니다
      </label>
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
        {pending ? "등록 중..." : "문의 등록"}
      </button>
    </form>
  );
}
