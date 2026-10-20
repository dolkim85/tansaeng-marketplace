import { deleteCategoryAction } from "@/server/categories/actions";
import { CategoryNameForm } from "./CategoryNameForm";
import { NewCategoryForm } from "./NewCategoryForm";

type ChildCategory = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

type TopCategory = ChildCategory & {
  children: ChildCategory[];
};

function DeleteOrBlocked({
  category,
  extraCount,
}: {
  category: ChildCategory;
  extraCount: number;
}) {
  const productCount = category._count.products;
  if (productCount > 0 || extraCount > 0) {
    const reasons = [
      productCount > 0 && `상품 ${productCount}개`,
      extraCount > 0 && `하위 카테고리 ${extraCount}개`,
    ].filter(Boolean);
    return (
      <span className="text-xs text-brand-deepgreen/40">
        삭제 불가({reasons.join(", ")} 연결됨)
      </span>
    );
  }
  return (
    <form action={deleteCategoryAction.bind(null, category.id)}>
      <button type="submit" className="text-xs text-red-600 underline-offset-2 hover:underline">
        삭제
      </button>
    </form>
  );
}

export function CategoryTree({ categories }: { categories: TopCategory[] }) {
  return (
    <div className="mt-2 space-y-4">
      {categories.map((top) => (
        <div key={top.id} className="rounded-lg border border-brand-deepgreen/15 bg-white p-3">
          <div className="flex items-center justify-between">
            <CategoryNameForm categoryId={top.id} name={top.name} />
            <DeleteOrBlocked category={top} extraCount={top.children.length} />
          </div>
          <p className="mt-0.5 text-[11px] text-brand-deepgreen/40">/{top.slug}</p>

          {top.children.length > 0 && (
            <ul className="mt-2 ml-4 space-y-2 border-l border-brand-deepgreen/10 pl-3">
              {top.children.map((child) => (
                <li key={child.id} className="flex items-center justify-between">
                  <div>
                    <CategoryNameForm categoryId={child.id} name={child.name} />
                    <p className="mt-0.5 text-[11px] text-brand-deepgreen/40">/{child.slug}</p>
                  </div>
                  <DeleteOrBlocked category={child} extraCount={0} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 ml-4">
            <NewCategoryForm parentId={top.id} placeholder="하위 카테고리 이름" />
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-brand-deepgreen/20 bg-white/60 p-3">
        <p className="mb-1 text-xs text-brand-deepgreen/60">새 최상위 카테고리 추가</p>
        <NewCategoryForm placeholder="최상위 카테고리 이름" />
      </div>
    </div>
  );
}
