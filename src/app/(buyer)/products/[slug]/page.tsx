import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, isWishlisted } from "@/server/catalog/queries";
import { toggleWishlistAction } from "@/server/catalog/actions";
import { addToCartAction } from "@/server/cart/actions";
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
  const boundAddToCart = addToCartAction.bind(null, product.id, product.slug);
  const canBuy = product.status === "ON_SALE" && product.stockQty > 0;
  const primaryImage = product.media.find((m) => m.kind === "image");
  const video = product.media.find((m) => m.kind === "video");
  const extraImages = product.media.filter(
    (m) => m.kind === "image" && m.id !== primaryImage?.id
  );

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
          className="mt-4 flex aspect-video w-full items-center justify-center rounded-lg bg-brand-green/10 text-sm text-brand-deepgreen/40"
        >
          사진 없음
        </div>
      )}

      {(extraImages.length > 0 || video) && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {extraImages.map((m) => (
            <Image
              key={m.id}
              src={m.url}
              alt=""
              width={96}
              height={96}
              className="h-20 w-20 shrink-0 rounded-md object-cover"
            />
          ))}
          {video && (
            <video
              src={video.url}
              controls
              className="h-20 w-32 shrink-0 rounded-md"
            />
          )}
        </div>
      )}

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
        <form action={boundAddToCart}>
          <button
            type="submit"
            disabled={!canBuy}
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {canBuy ? "장바구니 담기" : "품절/판매중지"}
          </button>
        </form>
      </div>

      {product.description && (
        <p className="mt-6 whitespace-pre-line text-sm text-brand-deepgreen/80">
          {product.description}
        </p>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-4 text-xs text-brand-deepgreen/60">
        M2 단계: 장바구니/주문/모의결제까지 연결됨. 리뷰/반품은 다음 단계에서 구현 예정.
      </div>
    </section>
  );
}
