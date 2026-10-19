import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

// 실제 운영 도메인은 아직 미확정(docs/PRODUCT_DECISIONS.md 참고) — 확정되면 이 값을 교체한다.
const BASE_URL = "http://127.0.0.1:3210";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, sellers] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ON_SALE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.seller.findMany({ select: { storeSlug: true } }),
  ]);

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/categories`, changeFrequency: "weekly" },
    { url: `${BASE_URL}/group-buys`, changeFrequency: "daily" },
    { url: `${BASE_URL}/upcoming`, changeFrequency: "daily" },
    ...categories.map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      changeFrequency: "daily" as const,
    })),
    ...products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
    })),
    ...sellers.map((s) => ({
      url: `${BASE_URL}/farms/${s.storeSlug}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
