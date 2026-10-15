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
