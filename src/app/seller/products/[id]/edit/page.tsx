import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/server/session";
import { getSellerProductWithMedia } from "@/server/seller/queries";
import { listApprovedCategoriesForSeller } from "@/server/categoryPermissions/queries";
import {
  deleteProductMediaAction,
  setPrimaryMediaAction,
} from "@/server/media/actions";
import { formatKRW } from "@/lib/currency";
import { ProductBlocksView } from "@/components/productBlocks/ProductBlocksView";
import { UploadForm } from "./UploadForm";
import { AddBlockForm } from "./AddBlockForm";
import { BlockManager } from "./BlockManager";
import { EditBasicInfoForm } from "./EditBasicInfoForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const product = session
    ? await getSellerProductWithMedia(id, session.sub)
    : null;
  if (!product) notFound();
  const categories = await listApprovedCategoriesForSeller(product.sellerId);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">
        /seller/products/{id}/edit
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        {product.title}
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        {product.category.name} · {formatKRW(product.priceKrw)} · 재고{" "}
        {product.stockQty}
      </p>
      <Link
        href={`/products/${product.slug}`}
        className="mt-1 inline-block text-xs text-brand-green hover:underline"
      >
        공개 상세페이지 미리보기 →
      </Link>

      {product.isProxyRegistered && (
        <p className="mt-2 rounded-md bg-brand-orange/10 p-2 text-xs text-brand-orange">
          운영자가 농가를 대신해 등록한 상품입니다
          {product.proxySourceNote && `(출처: ${product.proxySourceNote})`}.
          {product.status === "DRAFT"
            ? " 관리자 최종 승인 전까지는 공개되지 않습니다."
            : " 승인되어 공개 중입니다."}{" "}
          정보가 잘못되었거나 판매를 중단하고 싶으면 운영자에게 문의해 주세요.
        </p>
      )}

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
        사진 · 영상 ({product.media.filter((m) => m.kind === "image").length}/10,
        영상 {product.media.filter((m) => m.kind === "video").length}/1)
      </h2>
      <p className="text-xs text-brand-deepgreen/50">
        업로드 시 EXIF 위치정보 등 메타데이터는 자동 제거됩니다. 첫 번째(왼쪽) 사진이
        대표사진입니다.
      </p>

      {product.media.length === 0 ? (
        <p className="mt-3 text-sm text-brand-deepgreen/60">
          등록된 사진/영상이 없습니다.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {product.media.map((m, idx) => (
            <li
              key={m.id}
              className="relative overflow-hidden rounded-md border border-brand-green/15"
            >
              {m.kind === "image" ? (
                <Image
                  src={m.url}
                  alt={idx === 0 ? `${product.title} 대표 사진` : `${product.title} 사진 ${idx + 1}`}
                  width={160}
                  height={160}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <video
                  src={m.url}
                  controls
                  aria-label={`${product.title} 영상`}
                  className="aspect-square w-full object-cover"
                />
              )}
              {idx === 0 && m.kind === "image" && (
                <span className="absolute left-1 top-1 rounded bg-brand-orange px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  대표
                </span>
              )}
              <div className="flex gap-1 bg-white/90 p-1">
                {m.kind === "image" && idx !== 0 && (
                  <form action={setPrimaryMediaAction.bind(null, m.id)}>
                    <button
                      type="submit"
                      className="text-[10px] text-brand-green hover:underline"
                    >
                      대표로 설정
                    </button>
                  </form>
                )}
                <form
                  action={deleteProductMediaAction.bind(null, m.id)}
                  className="ml-auto"
                >
                  <button
                    type="submit"
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <UploadForm productId={product.id} />

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        상세페이지 블록
      </h2>
      <p className="text-xs text-brand-deepgreen/50">
        제목/문단/이미지/영상/표/구분선/FAQ/안내 배너 블록을 추가하고 순서를 바꿀 수 있습니다.
        블록을 하나도 추가하지 않으면 기존 설명(텍스트) 필드가 그대로 노출됩니다.
      </p>
      <BlockManager blocks={product.contentBlocks} />
      <AddBlockForm productId={product.id} media={product.media} />

      {product.contentBlocks.length > 0 && (
        <>
          <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
            미리보기
          </h2>
          <div className="mt-3 rounded-lg border border-brand-green/15 bg-white p-4">
            <ProductBlocksView blocks={product.contentBlocks} media={product.media} />
          </div>
        </>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        기본 정보 수정
      </h2>
      <EditBasicInfoForm productId={product.id} product={product} categories={categories} />
    </div>
  );
}
