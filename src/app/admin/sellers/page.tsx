import { listSellerApplications } from "@/server/admin/queries";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/server/admin/actions";
import { listAllCategoryPermissionsForAdmin } from "@/server/categoryPermissions/queries";
import {
  approveCategoryPermissionAction,
  rejectCategoryPermissionAction,
} from "@/server/categoryPermissions/actions";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "제출됨",
  UNDER_REVIEW: "심사중",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
};

const PERMISSION_STATUS_LABEL: Record<string, string> = {
  PENDING: "심사 대기",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
};

export default async function AdminSellersPage() {
  const [applications, categoryPermissions] = await Promise.all([
    listSellerApplications(),
    listAllCategoryPermissionsForAdmin(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">
        /admin/sellers
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        판매자 서류 심사/정지
      </h1>

      {applications.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          신청 내역이 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {applications.map((app) => (
            <li
              key={app.id}
              className="rounded-lg border border-brand-deepgreen/15 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-deepgreen">
                    {app.seller.storeName}{" "}
                    <span className="text-xs font-normal text-brand-deepgreen/50">
                      ({app.seller.user.email})
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-brand-deepgreen/60">
                    유형 {app.seller.identityType} · 신청일{" "}
                    {app.createdAt.toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                  {STATUS_LABEL[app.status]}
                </span>
              </div>

              {(app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
                <div className="mt-3 flex gap-2">
                  <form action={approveApplicationAction.bind(null, app.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      승인
                    </button>
                  </form>
                  <form action={rejectApplicationAction.bind(null, app.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      반려
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        카테고리별 판매 허가 요청
      </h2>
      {categoryPermissions.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          요청 내역이 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {categoryPermissions.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-brand-deepgreen">
                  {p.seller.storeName} · {p.category.name}
                </p>
                <p className="text-xs text-brand-deepgreen/50">
                  요청일 {p.createdAt.toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                  {PERMISSION_STATUS_LABEL[p.status]}
                </span>
                {p.status === "PENDING" && (
                  <>
                    <form action={approveCategoryPermissionAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        승인
                      </button>
                    </form>
                    <form action={rejectCategoryPermissionAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
                      >
                        반려
                      </button>
                    </form>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
