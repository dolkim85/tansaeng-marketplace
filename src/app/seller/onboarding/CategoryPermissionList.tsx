import { requestCategoryPermissionAction } from "@/server/categoryPermissions/actions";
import { REGULATED_CATEGORY_SLUGS } from "@/lib/regulatedCategories";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "심사 대기",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
};

type Row = {
  category: { id: string; slug: string; name: string };
  permission: { status: string } | null;
};

export function CategoryPermissionList({ rows }: { rows: Row[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {rows.map(({ category, permission }) => (
        <li
          key={category.id}
          className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
        >
          <div>
            <p className="font-medium text-brand-deepgreen">{category.name}</p>
            {REGULATED_CATEGORY_SLUGS.has(category.slug) && (
              <p className="text-[11px] text-brand-orange">
                추가 허가/신고/표시·이력관리 대상 품목 — 승인 전 증빙 확인 필요
              </p>
            )}
          </div>
          {permission && permission.status !== "REJECTED" ? (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                permission.status === "APPROVED"
                  ? "bg-brand-green/10 text-brand-green"
                  : "bg-brand-orange/10 text-brand-orange"
              }`}
            >
              {STATUS_LABEL[permission.status]}
            </span>
          ) : (
            <form action={requestCategoryPermissionAction.bind(null, category.id)}>
              <button
                type="submit"
                className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
              >
                {permission?.status === "REJECTED" ? "재요청" : "허가 요청"}
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
