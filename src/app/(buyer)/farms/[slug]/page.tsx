import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSellerStoreBySlug, isFollowingSeller } from "@/server/catalog/queries";
import { toggleFollowAction } from "@/server/catalog/actions";
import { getSession } from "@/server/session";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSellerStoreBySlug(slug);
  if (!result) return {};
  const description = `${result.seller.storeName}의 산지직송 상품을 만나보세요.`;
  const url = absoluteUrl(`/farms/${slug}`);
  return {
    title: result.seller.storeName,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: result.seller.storeName,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE }],
      type: "website",
    },
  };
}

export default async function FarmStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSellerStoreBySlug(slug);
  if (!result) notFound();
  const { seller, products } = result;

  const session = await getSession();
  const following = session
    ? await isFollowingSeller(session.sub, seller.id)
    : false;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/farms/{slug}</p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-deepgreen">
          {seller.storeName}
        </h1>
        <form action={toggleFollowAction.bind(null, seller.id, seller.storeSlug)}>
          <button
            type="submit"
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              following
                ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                : "border-brand-green/30 text-brand-deepgreen hover:bg-brand-green/10"
            }`}
          >
            {following ? "팔로잉" : "+ 팔로우"}
          </button>
        </form>
      </div>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        판매 유형: {seller.identityType}
      </p>

      {seller.introduction && (
        <>
          <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
            생산자 소개
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-brand-deepgreen/80">
            {seller.introduction}
          </p>
        </>
      )}

      {(seller.shippingPolicy || seller.returnPolicy) && (
        <>
          <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
            배송·반품 정책
          </h2>
          {seller.shippingPolicy && (
            <p className="mt-2 whitespace-pre-line text-sm text-brand-deepgreen/80">
              <span className="font-medium text-brand-deepgreen">배송 정책.</span>{" "}
              {seller.shippingPolicy}
            </p>
          )}
          {seller.returnPolicy && (
            <p className="mt-2 whitespace-pre-line text-sm text-brand-deepgreen/80">
              <span className="font-medium text-brand-deepgreen">반품 정책.</span>{" "}
              {seller.returnPolicy}
            </p>
          )}
        </>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        판매 중인 상품
      </h2>
      {products.length === 0 ? (
        <p className="mt-3 text-sm text-brand-deepgreen/70">
          판매 중인 상품이 없습니다.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
