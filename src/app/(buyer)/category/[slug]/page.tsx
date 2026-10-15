import { notFound } from "next/navigation";
import { getCategoryWithProducts } from "@/server/catalog/queries";
import { ProductCard } from "@/components/catalog/ProductCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCategoryWithProducts(slug);
  if (!result) notFound();
  const { category, products } = result;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/category/{slug}</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        {category.name}
      </h1>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          아직 등록된 상품이 없습니다.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
