import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, isWishlisted } from "@/server/catalog/queries";
import { toggleWishlistAction } from "@/server/catalog/actions";
import { getSession } from "@/server/session";
import { formatKRW } from "@/lib/currency";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await getSession();
  const wishlisted = session
    ? await isWishlisted(session.sub, product.id)
    : false;
  const boundToggle = toggleWishlistAction.bind(null, product.id, product.slug);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/products/{slug}</p>

      <div
        aria-hidden
        className="mt-4 flex aspect-video w-full items-center justify-center rounded-lg bg-brand-green/10 text-sm text-brand-deepgreen/40"
      >
        사진/영상 없음 (미디어 업로드는 다음 단계에서 구현)
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-brand-deepgreen">
        {product.title}
      </h1>
      <p className="mt-1 text-sm text-brand-deepgreen/60">
        {product.originRegion} ·{" "}
        <Link
          href={`/farms/${product.seller.storeSlug}`}
          className="hover:underline"
        >
          {product.seller.storeName}
        </Link>
      </p>
      <p className="mt-3 text-xl font-bold text-brand-green">
        {formatKRW(product.priceKrw)}
      </p>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        재고 {product.stockQty}개 · 카테고리 {product.category.name}
      </p>

      <div className="mt-5 flex gap-2">
        <form action={boundToggle}>
          <button
            type="submit"
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              wishlisted
                ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                : "border-brand-green/30 text-brand-deepgreen hover:bg-brand-green/10"
            }`}
          >
            {wishlisted ? "♥ 찜 완료" : "♡ 찜하기"}
          </button>
        </form>
        <button
          type="button"
          disabled
          className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white opacity-60"
          title="장바구니/주문은 M2에서 구현 예정"
        >
          장바구니(준비중)
        </button>
      </div>

      {product.description && (
        <p className="mt-6 whitespace-pre-line text-sm text-brand-deepgreen/80">
          {product.description}
        </p>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-4 text-xs text-brand-deepgreen/60">
        M1 단계: 찜 기능만 연결됨. 장바구니/주문/리뷰는 M2 이후 구현 예정.
      </div>
    </section>
  );
}
