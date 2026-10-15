import Link from "next/link";
import { listTopCategories } from "@/server/catalog/queries";

export default async function CategoriesPage() {
  const categories = await listTopCategories();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/categories</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        전체 카테고리
      </h1>

      <div className="mt-6 space-y-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <Link
              href={`/category/${cat.slug}`}
              className="text-lg font-semibold text-brand-deepgreen hover:text-brand-green"
            >
              {cat.name}
            </Link>
            {cat.children.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {cat.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.slug}`}
                    className="rounded-full border border-brand-green/20 px-3 py-1 text-sm text-brand-deepgreen hover:bg-brand-green/10"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-brand-deepgreen/60">
            등록된 카테고리가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
