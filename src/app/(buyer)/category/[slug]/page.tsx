import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryWithProducts } from "@/server/catalog/queries";
import { getActiveCategoryTopAd } from "@/server/ads/queries";
import { ProductCard } from "@/components/catalog/ProductCard";
import { AdCard } from "@/components/catalog/AdCard";
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryWithProducts(slug);
  if (!result) return {};
  const description = `${result.category.name} 카테고리의 산지직송 상품을 만나보세요.`;
  const url = absoluteUrl(`/category/${slug}`);
  return {
    title: result.category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: result.category.name,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE }],
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCategoryWithProducts(slug);
  if (!result) notFound();
  const { category, products } = result;
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];
  const topAd = await getActiveCategoryTopAd(categoryIds);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/category/{slug}</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        {category.name}
      </h1>

      {products.length === 0 && !topAd ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          아직 등록된 상품이 없습니다.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {topAd && <AdCard ad={topAd} />}
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
