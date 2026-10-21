import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, isWishlisted } from "@/server/catalog/queries";
import { toggleWishlistAction } from "@/server/catalog/actions";
import { addToCartAction } from "@/server/cart/actions";
import { listProductReviews } from "@/server/reviews/queries";
import { listPublicProductQuestions } from "@/server/support/queries";
import { getSession } from "@/server/session";
import { formatKRW } from "@/lib/currency";
import { ProductBlocksView } from "@/components/productBlocks/ProductBlocksView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description:
      product.description?.slice(0, 160) ||
      `${product.originRegion} · ${product.seller.storeName}에서 산지직송하는 ${product.title}`,
  };
}

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
  const boundAddToCart = addToCartAction.bind(null, product.id, product.slug);
  const canBuy = product.status === "ON_SALE" && product.stockQty > 0;
  const primaryImage = product.media.find((m) => m.kind === "image");
  const video = product.media.find((m) => m.kind === "video");
  const extraImages = product.media.filter(
    (m) => m.kind === "image" && m.id !== primaryImage?.id
  );
  const { reviews, avgRating } = await listProductReviews(product.id);
  const questions = await listPublicProductQuestions(product.id);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/products/{slug}</p>

      {primaryImage ? (
        <Image
          src={primaryImage.url}
          alt={product.title}
          width={800}
          height={450}
          className="mt-4 aspect-video w-full rounded-lg object-cover"
          priority
        />
      ) : (
        <div
          aria-hidden
          className="mt-4 flex aspect-video w-full items-center justify-center rounded-lg bg-brand-green/10 text-sm text-brand-deepgreen/70"
        >
          사진 없음
        </div>
      )}

      {(extraImages.length > 0 || video) && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {extraImages.map((m, idx) => (
            <Image
              key={m.id}
              src={m.url}
              alt={`${product.title} 사진 ${idx + 2}`}
              width={96}
              height={96}
              className="h-20 w-20 shrink-0 rounded-md object-cover"
            />
          ))}
          {video && (
            <video
              src={video.url}
              controls
              aria-label={`${product.title} 영상`}
              className="h-20 w-32 shrink-0 rounded-md"
            />
          )}
        </div>
      )}

      <h1 className="mt-4 text-2xl font-semibold text-brand-deepgreen">
        {product.title}
      </h1>
      <p className="mt-1 text-sm text-brand-deepgreen/70">
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
      <p className="mt-1 text-xs text-brand-deepgreen/70">
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
        <form action={boundAddToCart}>
          <button
            type="submit"
            disabled={!canBuy}
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {canBuy ? "장바구니 담기" : "품절/판매중지"}
          </button>
        </form>
        <Link
          href={`/help?new=product&productId=${product.id}`}
          className="rounded-md border border-brand-green/30 px-4 py-2 text-sm font-semibold text-brand-deepgreen hover:bg-brand-green/10"
        >
          판매자에게 문의하기
        </Link>
        <Link
          href={`/help?new=report&productId=${product.id}`}
          className="text-xs text-red-600 underline-offset-2 hover:underline"
        >
          신고하기
        </Link>
      </div>

      {product.seller.returnPolicy && (
        <p className="mt-4 rounded-md bg-brand-green/5 p-3 text-xs text-brand-deepgreen/70">
          <span className="font-medium text-brand-deepgreen">반품 정책.</span>{" "}
          {product.seller.returnPolicy}
        </p>
      )}

      {product.contentBlocks.length > 0 ? (
        <div className="mt-6">
          <ProductBlocksView blocks={product.contentBlocks} media={product.media} />
        </div>
      ) : (
        product.description && (
          <p className="mt-6 whitespace-pre-line text-sm text-brand-deepgreen/80">
            {product.description}
          </p>
        )
      )}

      <h2 className="mt-8 flex items-center gap-2 text-base font-semibold text-brand-deepgreen">
        후기 {reviews.length > 0 && `(평균 ${avgRating.toFixed(1)}점 · ${reviews.length}건)`}
      </h2>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          아직 작성된 후기가 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {r.user.name}
                </span>
                <span
                  className="text-xs text-brand-orange"
                  aria-label={`평점 5점 중 ${r.rating}점`}
                >
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">
                {r.comment}
              </p>
              {r.sellerReply && (
                <p className="mt-1 rounded bg-brand-green/5 p-2 text-xs text-brand-deepgreen/70">
                  판매자 답변: {r.sellerReply}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        상품 질문 {questions.length > 0 && `(${questions.length}건)`}
      </h2>
      {questions.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          공개된 질문이 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
            >
              <p className="font-medium text-brand-deepgreen">Q. {q.subject}</p>
              {q.messages.map((m, i) => (
                <p
                  key={m.id}
                  className="mt-1 whitespace-pre-line text-xs text-brand-deepgreen/70"
                >
                  {i === 0 ? "" : "A. "}
                  {m.body}
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
