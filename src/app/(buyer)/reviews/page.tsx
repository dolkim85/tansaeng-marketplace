import Link from "next/link";
import { getSession } from "@/server/session";
import { listMyReviews, listReviewableOrderItems } from "@/server/reviews/queries";
import { ReviewForm } from "./ReviewForm";

export default async function ReviewsPage() {
  const session = await getSession();
  const [reviewable, myReviews] = session
    ? await Promise.all([
        listReviewableOrderItems(session.sub),
        listMyReviews(session.sub),
      ])
    : [[], []];

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/reviews</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        후기
      </h1>

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
        작성 가능한 후기
      </h2>
      {reviewable.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          배송 완료된 주문 중 아직 후기를 쓰지 않은 상품이 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {reviewable.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3"
            >
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm font-medium text-brand-deepgreen hover:text-brand-green"
              >
                {item.titleSnapshot}
              </Link>
              <ReviewForm orderItemId={item.id} />
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        내가 쓴 후기
      </h2>
      {myReviews.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/70">
          작성한 후기가 없습니다.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {myReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/products/${r.product.slug}`}
                  className="font-medium text-brand-deepgreen hover:text-brand-green"
                >
                  {r.product.title}
                </Link>
                <span
                  className="text-xs text-brand-orange"
                  aria-label={`평점 5점 중 ${r.rating}점`}
                >
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">
                {r.comment}
              </p>
              {r.sellerReply && (
                <p className="mt-1 rounded bg-brand-green/5 p-2 text-xs text-brand-deepgreen/70">
                  판매자 답변: {r.sellerReply}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
