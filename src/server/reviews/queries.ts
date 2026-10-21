import "server-only";
import { prisma } from "@/lib/db";

export async function listProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  return { reviews, avgRating };
}

/** 구매 완료(Suborder.status=COMPLETED)했지만 아직 리뷰를 쓰지 않은 주문 항목 목록. */
export async function listReviewableOrderItems(userId: string) {
  return prisma.orderItem.findMany({
    where: {
      review: null,
      suborder: { status: "COMPLETED", order: { buyerId: userId } },
    },
    include: { product: true, suborder: { include: { order: true } } },
    orderBy: { id: "desc" },
  });
}

export async function listMyReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

/** 판매자 본인 상품에 달린 후기 전체(답변 작성/수정용, /seller/reviews). */
export async function listSellerReviews(sellerId: string) {
  return prisma.review.findMany({
    where: { product: { sellerId } },
    include: { user: true, product: true },
    orderBy: { createdAt: "desc" },
  });
}
