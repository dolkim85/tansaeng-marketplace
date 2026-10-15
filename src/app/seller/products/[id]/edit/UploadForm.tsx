"use client";

import { useActionState } from "react";
import { uploadProductMediaAction } from "@/server/media/actions";

export function UploadForm({ productId }: { productId: string }) {
  const boundAction = uploadProductMediaAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        required
        className="text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-green px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "업로드 중..." : "업로드"}
      </button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
