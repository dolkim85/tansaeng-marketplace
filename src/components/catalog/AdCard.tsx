import Link from "next/link";
import Image from "next/image";
import { formatKRW } from "@/lib/currency";

export type AdCardData = {
  id: string;
  product: {
    title: string;
    originRegion: string;
    priceKrw: number;
    seller: { storeName: string };
    media?: { url: string }[];
  };
};

/**
 * 검색/목록 품질 정책을 해치지 않도록 "광고" 라벨을 항상 명시한다(문서 11장).
 * 클릭은 /api/ads/[id]/click을 거쳐 클릭수를 집계한 뒤 실제 상품 페이지로 리다이렉트한다.
 */
export function AdCard({ ad }: { ad: AdCardData }) {
  const thumbnail = ad.product.media?.[0]?.url;

  return (
    <Link
      href={`/api/ads/${ad.id}/click`}
      className="relative block rounded-lg border border-brand-orange/40 bg-white p-3 hover:shadow-sm"
    >
      <span className="absolute left-2 top-2 z-10 rounded bg-brand-orange px-1.5 py-0.5 text-[10px] font-semibold text-white">
        광고
      </span>
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
          className="flex aspect-square w-full items-center justify-center rounded-md bg-brand-orange/10 text-xs text-brand-deepgreen/40"
        >
          사진 없음
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-brand-deepgreen">
        {ad.product.title}
      </p>
      <p className="text-xs text-brand-deepgreen/60">{ad.product.originRegion}</p>
      <p className="mt-1 text-sm font-semibold text-brand-green">
        {formatKRW(ad.product.priceKrw)}
      </p>
      <p className="text-xs text-brand-deepgreen/50">{ad.product.seller.storeName}</p>
    </Link>
  );
}
