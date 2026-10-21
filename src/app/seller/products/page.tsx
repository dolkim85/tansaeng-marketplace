import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication, listSellerProducts } from "@/server/seller/queries";
import {
  stopSellingProductAction,
  resumeSellingProductAction,
  resubmitForReviewAction,
} from "@/server/seller/actions";
import { formatKRW } from "@/lib/currency";
import { REGULATED_CATEGORY_SLUGS } from "@/lib/regulatedCategories";

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
            <li
              key={p.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
            >
              <Link
                href={`/seller/products/${p.id}/edit`}
                className="flex items-center gap-3 hover:opacity-90"
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
                  <p className="font-medium text-brand-deepgreen">
                    {p.isProxyRegistered && (
                      <span className="mr-1 rounded bg-brand-orange/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-orange">
                        대리등록
                      </span>
                    )}
                    {p.title}
                  </p>
                  <p className="text-xs text-brand-deepgreen/50">
                    {p.category.name} · {formatKRW(p.priceKrw)} · 재고{" "}
                    {p.stockQty}
                  </p>
                </div>
                <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                  {STATUS_LABEL[p.status]}
                </span>
              </Link>
              {p.isProxyRegistered && p.proxySourceNote && (
                <p className="mt-2 text-xs text-brand-deepgreen/50">
                  운영자가 대신 등록한 상품입니다(출처: {p.proxySourceNote}
                  {p.proxyConsentAt &&
                    ` · 동의 확인 ${p.proxyConsentAt.toLocaleDateString("ko-KR")}`}
                  ).
                </p>
              )}
              {p.status === "DRAFT" && p.reviewNote && (
                <p className="mt-2 text-xs text-brand-orange">
                  검수 반려 사유: {p.reviewNote}
                </p>
              )}
              {approved && p.status === "DRAFT" && REGULATED_CATEGORY_SLUGS.has(p.category.slug) && (
                <div className="mt-2">
                  <form action={resubmitForReviewAction.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="text-xs text-brand-green underline-offset-2 hover:underline"
                    >
                      {p.reviewNote ? "보완 후 재제출" : "검수 제출"}
                    </button>
                  </form>
                </div>
              )}
              {p.isAdminSuspended && (
                <p className="mt-2 text-xs text-red-600">
                  관리자에 의해 강제 숨김 처리되었습니다(사유: {p.suspendedReason}).
                  해제 전까지는 직접 판매재개할 수 없습니다.
                </p>
              )}
              {(p.status === "ON_SALE" || p.status === "HIDDEN") && (
                <div className="mt-2">
                  {p.status === "ON_SALE" ? (
                    <form action={stopSellingProductAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-600 underline-offset-2 hover:underline"
                      >
                        판매중단
                      </button>
                    </form>
                  ) : !p.isAdminSuspended ? (
                    <form action={resumeSellingProductAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="text-xs text-brand-green underline-offset-2 hover:underline"
                      >
                        판매재개
                      </button>
                    </form>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
