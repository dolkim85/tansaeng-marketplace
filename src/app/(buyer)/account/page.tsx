import { getSession } from "@/server/session";
import { logoutAction } from "@/server/auth/actions";
import { setDefaultAddressAction, deleteAddressAction } from "@/server/account/actions";
import { listAddresses } from "@/server/account/queries";
import { AddressForm } from "./AddressForm";
import { PasswordForm } from "./PasswordForm";
import Link from "next/link";

export default async function AccountPage() {
  const session = await getSession();
  const addresses = session ? await listAddresses(session.sub) : [];

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
              <span className="text-brand-deepgreen/70">이름</span>{" "}
              <span className="font-medium">{session.name}</span>
            </p>
            <p className="mt-1">
              <span className="text-brand-deepgreen/70">역할</span>{" "}
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

          <div>
            <h2 className="text-sm font-semibold text-brand-deepgreen">배송지 관리</h2>
            {addresses.length > 0 && (
              <ul className="mt-2 space-y-2">
                {addresses.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
                  >
                    <p className="font-medium text-brand-deepgreen">
                      {a.isDefault && (
                        <span className="mr-1 rounded bg-brand-green/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-green">
                          기본
                        </span>
                      )}
                      {a.label && <span className="text-brand-deepgreen/70">[{a.label}] </span>}
                      {a.recipientName} · {a.recipientPhone}
                    </p>
                    <p className="mt-1 text-xs text-brand-deepgreen/70">{a.addressLine}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {!a.isDefault && (
                        <form action={setDefaultAddressAction.bind(null, a.id)}>
                          <button
                            type="submit"
                            className="text-xs text-brand-green underline-offset-2 hover:underline"
                          >
                            기본으로 설정
                          </button>
                        </form>
                      )}
                      <form action={deleteAddressAction.bind(null, a.id)}>
                        <button
                          type="submit"
                          className="text-xs text-red-600 underline-offset-2 hover:underline"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <AddressForm hasAddresses={addresses.length > 0} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-brand-deepgreen">비밀번호 변경</h2>
            <PasswordForm />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-brand-deepgreen">알림 수신동의</h2>
            <p className="mt-1 text-xs text-brand-deepgreen/70">
              광고성 정보 수신동의 및 공동구매 오픈 알림 설정은{" "}
              <Link href="/alerts" className="text-brand-green underline-offset-2 hover:underline">
                /alerts
              </Link>
              에서 관리할 수 있습니다.
            </p>
          </div>

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
    </section>
  );
}
