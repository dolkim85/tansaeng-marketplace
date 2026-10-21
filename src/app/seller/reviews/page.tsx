import Link from "next/link";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { listSellerReviews } from "@/server/reviews/queries";
import { ReplyForm } from "./ReplyForm";

export default async function SellerReviewsPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;
  const reviews = result ? await listSellerReviews(result.seller.id) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller/reviews</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        후기 관리/답변
      </h1>

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/70">
          작성된 후기가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r) => (
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
                {r.user.name} · {r.createdAt.toLocaleDateString("ko-KR")}
              </p>
              <p className="mt-1 text-sm text-brand-deepgreen">{r.comment}</p>
              <ReplyForm reviewId={r.id} currentReply={r.sellerReply} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
