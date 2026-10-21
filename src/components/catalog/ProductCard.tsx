import Link from "next/link";
import Image from "next/image";
import { formatKRW } from "@/lib/currency";

export type ProductCardData = {
  slug: string;
  title: string;
  originRegion: string;
  priceKrw: number;
  seller: { storeName: string };
  media?: { url: string }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const thumbnail = product.media?.[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-lg border border-brand-green/15 bg-white p-3 hover:shadow-sm"
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt=""
          width={300}
          height={300}
          className="aspect-square w-full rounded-md object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex aspect-square w-full items-center justify-center rounded-md bg-brand-green/10 text-xs text-brand-deepgreen/70"
        >
          사진 없음
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-brand-deepgreen">
        {product.title}
      </p>
      <p className="text-xs text-brand-deepgreen/70">{product.originRegion}</p>
      <p className="mt-1 text-sm font-semibold text-brand-green">
        {formatKRW(product.priceKrw)}
      </p>
      <p className="text-xs text-brand-deepgreen/70">
        {product.seller.storeName}
      </p>
    </Link>
  );
}
