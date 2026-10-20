"use client";

import { useActionState } from "react";
import { renameCategoryAction } from "@/server/categories/actions";

export function CategoryNameForm({
  categoryId,
  name,
}: {
  categoryId: string;
  name: string;
}) {
  const boundAction = renameCategoryAction.bind(null, categoryId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="flex items-center gap-1">
      <input
        name="name"
        defaultValue={name}
        required
        className="w-36 rounded-md border border-brand-deepgreen/20 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-brand-green underline-offset-2 hover:underline disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
      {state?.error && (
        <span role="alert" className="text-xs text-red-600">
          {state.error}
        </span>
      )}
    </form>
  );
}
