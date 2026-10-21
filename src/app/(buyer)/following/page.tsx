import { getSession } from "@/server/session";
import { listFollowedSellers } from "@/server/catalog/queries";
import { toggleFollowAction } from "@/server/catalog/actions";
import Link from "next/link";

export default async function FollowingPage() {
  const session = await getSession();
  const items = session ? await listFollowedSellers(session.sub) : [];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/following</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        팔로우한 생산자
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        팔로우는 마케팅 수신 동의가 아닙니다.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          아직 팔로우한 생산자가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-4"
            >
              <Link
                href={`/farms/${f.seller.storeSlug}`}
                className="text-sm font-medium text-brand-deepgreen hover:text-brand-green"
              >
                {f.seller.storeName}
              </Link>
              <form
                action={toggleFollowAction.bind(
                  null,
                  f.seller.id,
                  f.seller.storeSlug
                )}
              >
                <button
                  type="submit"
                  className="rounded-md border border-brand-green/30 px-3 py-1.5 text-xs text-brand-deepgreen hover:bg-brand-green/10"
                >
                  팔로우 해제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
