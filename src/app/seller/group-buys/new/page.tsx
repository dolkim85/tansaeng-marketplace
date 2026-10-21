import { getSession } from "@/server/session";
import { listSellerProductsWithoutGroupBuy } from "@/server/seller/queries";
import { prisma } from "@/lib/db";
import { GroupBuyForm } from "./GroupBuyForm";

export default async function NewGroupBuyPage() {
  const session = await getSession();
  const seller = session
    ? await prisma.seller.findUnique({ where: { userId: session.sub } })
    : null;
  const products = seller
    ? await listSellerProductsWithoutGroupBuy(seller.id)
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-deepgreen">
        공동구매 등록
      </h1>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-brand-deepgreen/70">
          공동구매로 등록할 수 있는 상품이 없습니다(이미 등록된 상품 제외). 먼저
          상품을 등록하세요.
        </p>
      ) : (
        <GroupBuyForm products={products} />
      )}
    </div>
  );
}
