import type { Metadata } from "next";
import Link from "next/link";
import { listTopCategories } from "@/server/catalog/queries";
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

const TITLE = "전체 카테고리";
const DESCRIPTION = "농산물·축산물·수산물 등 탄생의 전체 카테고리를 둘러보세요.";
const URL = absoluteUrl("/categories");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
};

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
          <p className="text-sm text-brand-deepgreen/70">
            등록된 카테고리가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
