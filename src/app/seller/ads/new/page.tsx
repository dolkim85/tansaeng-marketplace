import { getSession } from "@/server/session";
import { prisma } from "@/lib/db";
import { AdForm } from "./AdForm";

export default async function NewAdPage() {
  const session = await getSession();
  const seller = session
    ? await prisma.seller.findUnique({ where: { userId: session.sub } })
    : null;
  const products = seller
    ? await prisma.product.findMany({
        where: { sellerId: seller.id, status: "ON_SALE" },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-deepgreen">광고 신청</h1>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-brand-deepgreen/60">
          판매중(ON_SALE) 상품이 없습니다. 먼저 상품을 등록/판매 상태로 전환하세요.
        </p>
      ) : (
        <AdForm products={products} />
      )}
    </div>
  );
}
