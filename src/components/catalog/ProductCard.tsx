import Link from "next/link";
import { formatKRW } from "@/lib/currency";

export type ProductCardData = {
  slug: string;
  title: string;
  originRegion: string;
  priceKrw: number;
  seller: { storeName: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-lg border border-brand-green/15 bg-white p-3 hover:shadow-sm"
    >
      <div
        aria-hidden
        className="flex aspect-square w-full items-center justify-center rounded-md bg-brand-green/10 text-xs text-brand-deepgreen/40"
      >
        사진 없음
      </div>
      <p className="mt-2 text-sm font-medium text-brand-deepgreen">
        {product.title}
      </p>
      <p className="text-xs text-brand-deepgreen/60">{product.originRegion}</p>
      <p className="mt-1 text-sm font-semibold text-brand-green">
        {formatKRW(product.priceKrw)}
      </p>
      <p className="text-xs text-brand-deepgreen/50">
        {product.seller.storeName}
      </p>
    </Link>
  );
}
