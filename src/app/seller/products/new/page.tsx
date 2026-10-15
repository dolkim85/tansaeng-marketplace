import { listAllCategoriesFlat } from "@/server/seller/queries";
import { ProductForm } from "./ProductForm";

export default async function NewProductPage() {
  const categories = await listAllCategoriesFlat();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">
        /seller/products/new
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        쉬운 상품 등록
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
