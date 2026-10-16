import Link from "next/link";
import { listAllProductsForAdmin } from "@/server/admin/queries";
import { approveProxyProductAction, deleteProxyProductAction } from "@/server/admin/actions";
import { formatKRW } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "임시저장",
  IN_REVIEW: "검수중",
  ON_SALE: "판매중",
  HIDDEN: "숨김",
  SOLD_OUT: "품절",
};

export default async function AdminProductsPage() {
  const products = await listAllProductsForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">
        /admin/products
      </p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-deepgreen">
          상품 검수/신고/카테고리
        </h1>
        <Link
          href="/admin/products/proxy-new"
          className="rounded-md bg-brand-deepgreen px-3 py-2 text-sm font-semibold text-white"
        >
          + 대리등록
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          등록된 상품이 없습니다.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-deepgreen/15 text-xs text-brand-deepgreen/50">
              <th className="py-2">상품명</th>
              <th className="py-2">판매자</th>
              <th className="py-2">카테고리</th>
              <th className="py-2">가격</th>
              <th className="py-2">상태</th>
              <th className="py-2">대리등록</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-brand-deepgreen/5">
                <td className="py-2">{p.title}</td>
                <td className="py-2 text-brand-deepgreen/60">
                  {p.seller.storeName}
                </td>
                <td className="py-2 text-brand-deepgreen/60">
                  {p.category.name}
                </td>
                <td className="py-2">{formatKRW(p.priceKrw)}</td>
                <td className="py-2">
                  <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="py-2">
                  {p.isProxyRegistered ? (
                    p.status === "DRAFT" ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs text-brand-orange">
                          승인 대기
                        </span>
                        <form action={approveProxyProductAction.bind(null, p.id)}>
                          <button type="submit" className="text-xs text-brand-green underline-offset-2 hover:underline">
                            승인
                          </button>
                        </form>
                        <form action={deleteProxyProductAction.bind(null, p.id)}>
                          <button type="submit" className="text-xs text-red-600 underline-offset-2 hover:underline">
                            삭제
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs text-brand-deepgreen/60">
                        승인됨
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-brand-deepgreen/30">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-6 rounded-lg border border-dashed border-brand-deepgreen/20 bg-white/60 p-3 text-xs text-brand-deepgreen/50">
        대리등록 상품의 승인/삭제만 가능. 일반 상품의 숨김/신고 처리는 다음 단계에서 구현 예정.
      </p>
    </div>
  );
}
