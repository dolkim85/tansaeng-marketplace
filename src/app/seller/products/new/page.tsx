import Link from "next/link";
import { getSession } from "@/server/session";
import { prisma } from "@/lib/db";
import { listApprovedCategoriesForSeller } from "@/server/categoryPermissions/queries";
import { ProductForm } from "./ProductForm";

export default async function NewProductPage() {
  const session = await getSession();
  const seller = session
    ? await prisma.seller.findUnique({ where: { userId: session.sub } })
    : null;
  const categories = seller ? await listApprovedCategoriesForSeller(seller.id) : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">
        /seller/products/new
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        쉬운 상품 등록
      </h1>

      {categories.length === 0 ? (
        <p className="mt-5 text-sm text-brand-deepgreen/60">
          판매 허가를 받은 카테고리가 없습니다.{" "}
          <Link
            href="/seller/onboarding"
            className="text-brand-green underline-offset-2 hover:underline"
          >
            카테고리 판매 허가 요청하러 가기 →
          </Link>
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
