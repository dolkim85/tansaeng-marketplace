import { getSession } from "@/server/session";
import { logoutAction } from "@/server/auth/actions";
import Link from "next/link";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/account</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        회원 설정
      </h1>

      {session ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-brand-green/15 bg-white p-4 text-sm">
            <p>
              <span className="text-brand-deepgreen/60">이름</span>{" "}
              <span className="font-medium">{session.name}</span>
            </p>
            <p className="mt-1">
              <span className="text-brand-deepgreen/60">역할</span>{" "}
              <span className="font-medium">{session.role}</span>
            </p>
          </div>
          {session.role === "BUYER" && (
            <Link
              href="/seller/onboarding"
              className="inline-block text-sm text-brand-green underline-offset-2 hover:underline"
            >
              판매자로 입점 신청하기 →
            </Link>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-brand-green/30 px-4 py-2 text-sm font-semibold text-brand-deepgreen hover:bg-brand-green/10"
            >
              로그아웃
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-4 text-sm text-brand-deepgreen/70">
          로그인이 필요합니다.
        </p>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-4 text-xs text-brand-deepgreen/60">
        M1 단계: 배송지/동의/보안 설정 등 상세 기능은 다음 단계에서 구현 예정.
      </div>
    </section>
  );
}
