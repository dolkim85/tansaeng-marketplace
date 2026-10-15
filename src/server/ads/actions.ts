"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export type AdFormState = { error?: string } | undefined;

const requestAdSchema = z.object({
  productId: z.string().min(1),
  placement: z.enum(["SEARCH", "CATEGORY_TOP", "HOME_BANNER"]),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

export async function requestAdAction(
  _prevState: AdFormState,
  formData: FormData
): Promise<AdFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/ads");

  const parsed = requestAdSchema.safeParse({
    productId: formData.get("productId"),
    placement: formData.get("placement"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.sub },
  });
  if (!seller) return { error: "판매자 정보가 없습니다." };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || product.sellerId !== seller.id) {
    return { error: "본인 상품만 광고로 신청할 수 있습니다." };
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (!(startAt < endAt)) {
    return { error: "종료 시각은 시작 시각보다 뒤여야 합니다." };
  }

  await prisma.ad.create({
    data: {
      sellerId: seller.id,
      productId: parsed.data.productId,
      placement: parsed.data.placement,
      startAt,
      endAt,
    },
  });

  revalidatePath("/seller/ads");
  redirect("/seller/ads");
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

export async function approveAdAction(adId: string): Promise<void> {
  const session = await requireAdmin();
  await prisma.ad.update({
    where: { id: adId },
    data: { status: "APPROVED", reviewedBy: session.sub, reviewedAt: new Date() },
  });
  revalidatePath("/admin/ads");
}

export async function rejectAdAction(adId: string): Promise<void> {
  const session = await requireAdmin();
  await prisma.ad.update({
    where: { id: adId },
    data: { status: "REJECTED", reviewedBy: session.sub, reviewedAt: new Date() },
  });
  revalidatePath("/admin/ads");
}
