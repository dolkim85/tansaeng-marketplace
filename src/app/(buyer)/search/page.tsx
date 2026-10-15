import { searchProducts } from "@/server/catalog/queries";
import { ProductCard } from "@/components/catalog/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q.trim() ? await searchProducts(q) : [];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/search</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        검색 결과 {q && `: "${q}"`}
      </h1>

      {!q.trim() ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          검색어를 입력하세요.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          검색 결과가 없습니다.
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
