import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication, listSellerProducts } from "@/server/seller/queries";
import { formatKRW } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "임시저장",
  IN_REVIEW: "검수중",
  ON_SALE: "판매중",
  HIDDEN: "숨김",
  SOLD_OUT: "품절",
};

export default async function SellerProductsPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-brand-deepgreen/60">
          <Link href="/seller/onboarding" className="text-brand-green underline">
            입점 심사를 먼저 신청하세요 →
          </Link>
        </p>
      </div>
    );
  }

  const products = await listSellerProducts(result.seller.id);
  const approved = result.latestApplication?.status === "APPROVED";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-deepgreen">
          상품 목록/재고/승인상태
        </h1>
        <Link
          href="/seller/products/new"
          className="rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white"
        >
          + 상품 등록
        </Link>
      </div>

      {!approved && (
        <p className="mt-3 rounded-md bg-brand-orange/10 p-3 text-xs text-brand-orange">
          입점 심사가 아직 승인되지 않아 등록한 상품은 임시저장(DRAFT) 상태로만
          저장되며 구매자에게 노출되지 않습니다.
        </p>
      )}

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          등록된 상품이 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/seller/products/${p.id}/edit`}
                className="flex items-center gap-3 rounded-lg border border-brand-green/15 bg-white p-3 text-sm hover:bg-brand-green/5"
              >
                {p.media[0] ? (
                  <Image
                    src={p.media[0].url}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-green/10 text-[9px] text-brand-deepgreen/40">
                    사진없음
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-brand-deepgreen">{p.title}</p>
                  <p className="text-xs text-brand-deepgreen/50">
                    {p.category.name} · {formatKRW(p.priceKrw)} · 재고{" "}
                    {p.stockQty}
                  </p>
                </div>
                <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                  {STATUS_LABEL[p.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
