import { getSession } from "@/server/session";
import { listWishlist } from "@/server/catalog/queries";
import { toggleWishlistAction } from "@/server/catalog/actions";
import { formatKRW } from "@/lib/currency";
import Link from "next/link";

export default async function WishlistPage() {
  const session = await getSession();
  const items = session ? await listWishlist(session.sub) : [];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/wishlist</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        찜한 상품
      </h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          아직 찜한 상품이 없습니다.{" "}
          <Link href="/categories" className="text-brand-green hover:underline">
            카테고리 둘러보기 →
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-4"
            >
              <div>
                <Link
                  href={`/products/${w.product.slug}`}
                  className="text-sm font-medium text-brand-deepgreen hover:text-brand-green"
                >
                  {w.product.title}
                </Link>
                <p className="text-xs text-brand-deepgreen/60">
                  {w.product.seller.storeName} ·{" "}
                  {formatKRW(w.product.priceKrw)}
                </p>
              </div>
              <form
                action={toggleWishlistAction.bind(
                  null,
                  w.product.id,
                  w.product.slug
                )}
              >
                <button
                  type="submit"
                  className="rounded-md border border-brand-green/30 px-3 py-1.5 text-xs text-brand-deepgreen hover:bg-brand-green/10"
                >
                  찜 해제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
