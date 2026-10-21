"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

export type ReviewFormState = { error?: string } | undefined;

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(2, "후기 내용을 2자 이상 입력하세요."),
});

export async function createReviewAction(
  orderItemId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/reviews");

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { suborder: { include: { order: true } }, review: true },
  });

  if (
    !orderItem ||
    orderItem.suborder.order.buyerId !== session.sub ||
    orderItem.suborder.status !== "COMPLETED"
  ) {
    return { error: "리뷰를 작성할 수 없는 주문입니다." };
  }
  if (orderItem.review) {
    return { error: "이미 작성한 후기가 있습니다." };
  }

  await prisma.review.create({
    data: {
      orderItemId,
      userId: session.sub,
      productId: orderItem.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath("/reviews");
  revalidatePath(`/orders/${orderItem.suborder.orderId}`);
  return undefined;
}

const sellerReplySchema = z.object({
  reply: z.string().max(1000, "답변은 1000자 이내로 입력하세요.").optional(),
});

/// 판매자가 자신의 상품에 달린 후기에 답변을 작성/수정한다(이미 작성된 답변도
/// 다시 제출해 고칠 수 있음 — 1회성 제약 없음). 빈 문자열로 제출하면 답변을 지운다.
export async function replyToReviewAction(
  reviewId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/reviews");

  const parsed = sellerReplySchema.safeParse({
    reply: formData.get("reply") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const seller = await prisma.seller.findUnique({ where: { userId: session.sub } });
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { product: true },
  });
  if (!review || !seller || review.product.sellerId !== seller.id) {
    return { error: "본인 상품의 후기만 답변할 수 있습니다." };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { sellerReply: parsed.data.reply?.trim() || null },
  });

  revalidatePath("/seller/reviews");
  revalidatePath("/reviews");
  revalidatePath(`/products/${review.product.slug}`);
  return undefined;
}
