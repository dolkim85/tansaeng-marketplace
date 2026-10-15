import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { OnboardingForm } from "./OnboardingForm";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "제출됨 (심사 대기)",
  UNDER_REVIEW: "심사 중",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
};

export default async function SellerOnboardingPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller/onboarding</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        판매자 서류·신원·품목 심사
      </h1>

      {result?.latestApplication ? (
        <div className="mt-5 rounded-lg border border-brand-green/15 bg-white p-4 text-sm">
          <p>
            <span className="text-brand-deepgreen/60">스토어</span>{" "}
            <span className="font-medium">{result.seller.storeName}</span>
          </p>
          <p className="mt-1">
            <span className="text-brand-deepgreen/60">심사 상태</span>{" "}
            <span className="font-semibold text-brand-green">
              {STATUS_LABEL[result.latestApplication.status]}
            </span>
          </p>
          {result.latestApplication.status === "REJECTED" && (
            <p className="mt-2 text-xs text-red-600">
              반려되었습니다. 아래에서 재신청할 수 있습니다.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-brand-deepgreen/60">
          아직 입점 신청 내역이 없습니다. 아래 양식으로 신청하세요.
        </p>
      )}

      {(!result?.latestApplication ||
        result.latestApplication.status === "REJECTED") && (
        <OnboardingForm />
      )}
    </div>
  );
}
