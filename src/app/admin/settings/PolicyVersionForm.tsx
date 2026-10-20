"use client";

import { useActionState } from "react";
import { createPolicyVersionAction } from "@/server/policyVersions/actions";

export function PolicyVersionForm() {
  const [state, formAction, pending] = useActionState(createPolicyVersionAction, undefined);

  return (
    <form action={formAction} className="mt-3 max-w-xl space-y-2 rounded-lg border border-brand-deepgreen/15 bg-white p-4">
      <div className="flex gap-2">
        <input
          name="title"
          required
          placeholder="약관 이름(예: 이용약관, 개인정보처리방침)"
          className="flex-1 rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
        <input
          name="version"
          required
          placeholder="버전(예: 1.0)"
          className="w-28 rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        name="content"
        required
        rows={5}
        placeholder="약관 전문을 입력하세요."
        className="w-full rounded-md border border-brand-deepgreen/20 px-3 py-2 text-sm"
      />
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-deepgreen px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "등록 중..." : "새 버전 등록"}
      </button>
      <p className="text-[11px] text-brand-deepgreen/50">
        등록 후에는 수정/삭제할 수 없습니다. 과거 버전의 정확한 보존이 목적입니다.
      </p>
    </form>
  );
}
