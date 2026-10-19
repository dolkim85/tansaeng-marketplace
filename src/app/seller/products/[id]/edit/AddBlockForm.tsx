"use client";

import { useState, useActionState } from "react";
import { addBlockAction } from "@/server/productBlocks/actions";
import { BLOCK_TYPES, BLOCK_TYPE_LABEL, type ProductBlockType } from "@/lib/productBlocks";

type Media = { id: string; kind: string; url: string };

export function AddBlockForm({ productId, media }: { productId: string; media: Media[] }) {
  const [type, setType] = useState<ProductBlockType>("PARAGRAPH");
  const boundAction = addBlockAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const images = media.filter((m) => m.kind === "image");
  const videos = media.filter((m) => m.kind === "video");

  return (
    <form
      action={formAction}
      className="mt-3 space-y-2 rounded-lg border border-brand-green/20 bg-white p-4"
    >
      <label htmlFor="block-type" className="block text-xs text-brand-deepgreen/70">
        블록 종류
      </label>
      <select
        id="block-type"
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value as ProductBlockType)}
        className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
      >
        {BLOCK_TYPES.map((t) => (
          <option key={t} value={t}>
            {BLOCK_TYPE_LABEL[t]}
          </option>
        ))}
      </select>

      {(type === "HEADING" || type === "BANNER") && (
        <input
          name="text"
          required
          placeholder={type === "HEADING" ? "제목" : "안내 문구"}
          className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      )}
      {type === "BANNER" && (
        <select
          name="tone"
          defaultValue="info"
          className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          <option value="info">안내(초록)</option>
          <option value="warning">주의(주황)</option>
        </select>
      )}
      {type === "PARAGRAPH" && (
        <textarea
          name="text"
          required
          rows={4}
          placeholder="문단 내용을 입력하세요."
          className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      )}
      {type === "IMAGE" && (
        <select
          name="mediaId"
          required
          className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          <option value="">사진 선택</option>
          {images.map((m) => (
            <option key={m.id} value={m.id}>
              {m.url.split("/").pop()}
            </option>
          ))}
        </select>
      )}
      {type === "VIDEO" && (
        <select
          name="mediaId"
          required
          className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        >
          <option value="">영상 선택</option>
          {videos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.url.split("/").pop()}
            </option>
          ))}
        </select>
      )}
      {type === "TABLE" && (
        <>
          <label className="flex items-center gap-2 text-xs text-brand-deepgreen/70">
            <input type="checkbox" name="hasHeader" className="rounded" />첫 줄을 표 머리글로 사용
          </label>
          <textarea
            name="rowsText"
            required
            rows={4}
            placeholder={"칸은 | 로 구분, 줄마다 한 행\n예) 품목 | 중량 | 원산지\n감자 | 10kg | 강원 평창"}
            className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
          />
        </>
      )}
      {type === "DIVIDER" && (
        <p className="text-xs text-brand-deepgreen/50">
          추가 입력 없이 구분선만 삽입됩니다.
        </p>
      )}
      {type === "FAQ" && (
        <textarea
          name="faqText"
          required
          rows={4}
          placeholder={
            "줄마다 'Q: 질문 / A: 답변' 형식으로 입력\n예) Q: 배송은 며칠 걸리나요? / A: 결제 후 2~3일 이내 출고됩니다."
          }
          className="w-full rounded-md border border-brand-green/20 px-3 py-2 text-sm"
        />
      )}

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
        {pending ? "추가 중..." : "블록 추가"}
      </button>
    </form>
  );
}
