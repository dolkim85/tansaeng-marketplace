"use client";

import { useActionState } from "react";
import { createCategoryAction } from "@/server/categories/actions";

export function NewCategoryForm({
  parentId,
  placeholder,
}: {
  parentId?: string;
  placeholder: string;
}) {
  const [state, formAction, pending] = useActionState(createCategoryAction, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1">
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <input
        name="name"
        required
        aria-label="카테고리 이름"
        placeholder={placeholder}
        className="w-36 rounded-md border border-brand-deepgreen/20 px-2 py-1 text-sm"
      />
      <input
        name="slug"
        aria-label="슬러그"
        placeholder="슬러그(선택, 비워두면 자동)"
        className="w-40 rounded-md border border-brand-deepgreen/20 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-deepgreen px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "추가 중..." : "추가"}
      </button>
      {state?.error && (
        <span role="alert" className="w-full text-xs text-red-600">
          {state.error}
        </span>
      )}
    </form>
  );
}
