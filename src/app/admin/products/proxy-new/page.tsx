import { listSellersForProxySelect } from "@/server/admin/queries";
import { listAllCategoriesFlat } from "@/server/seller/queries";
import { ProxyProductForm } from "./ProxyProductForm";

export default async function ProxyNewProductPage() {
  const [sellers, categories] = await Promise.all([
    listSellersForProxySelect(),
    listAllCategoriesFlat(),
  ]);

  const sellerOptions = sellers.map((s) => ({
    id: s.id,
    storeName: s.storeName,
    userName: s.user.name,
    applicationStatus: s.applications[0]?.status ?? "미신청",
  }));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">
        /admin/products/proxy-new
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        대리등록 (운영자가 농가 대신 상품 등록)
      </h1>
      <p className="mt-2 text-xs text-brand-deepgreen/60">
        등록 즉시 공개되지 않습니다. 임시저장(DRAFT) 상태로 생성되며, 관리자가 별도로
        &quot;승인&quot;해야 구매자에게 노출됩니다(마스터 문서 10.3절 — 농가 동의 없는
        무단 게시 금지).
      </p>

      {sellerOptions.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          등록된 판매자(농가)가 없습니다.
        </p>
      ) : (
        <ProxyProductForm sellers={sellerOptions} categories={categories} />
      )}
    </div>
  );
}
