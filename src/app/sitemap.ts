import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL as BASE_URL } from "@/lib/seo";

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
