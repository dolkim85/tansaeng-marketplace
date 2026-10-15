"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify, randomSuffix } from "@/lib/slug";
import { getSession } from "@/server/session";
import { createSessionCookie } from "@/server/session";

export type FormState = { error?: string } | undefined;

const applicationSchema = z.object({
  storeName: z.string().min(2, "농장/스토어 이름을 입력하세요."),
  identityType: z.enum(["BUSINESS_PRODUCER", "FARM_ENTITY_ONLY"]),
});

export async function submitSellerApplicationAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/onboarding");

  const parsed = applicationSchema.safeParse({
    storeName: formData.get("storeName"),
    identityType: formData.get("identityType"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const existingSeller = await prisma.seller.findUnique({
    where: { userId: session.sub },
    include: { applications: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (existingSeller) {
    const latest = existingSeller.applications[0];
    if (latest && latest.status !== "REJECTED") {
      return { error: "이미 심사 중이거나 승인된 신청이 있습니다." };
    }
    await prisma.sellerApplication.create({
      data: { sellerId: existingSeller.id, status: "SUBMITTED" },
    });
  } else {
    const storeSlug = `${slugify(parsed.data.storeName)}-${randomSuffix()}`;
    await prisma.seller.create({
      data: {
        userId: session.sub,
        storeName: parsed.data.storeName,
        storeSlug,
        identityType: parsed.data.identityType,
        applications: { create: { status: "SUBMITTED" } },
      },
    });

    if (session.role === "BUYER") {
      await prisma.user.update({
        where: { id: session.sub },
        data: { role: "SELLER" },
      });
      await createSessionCookie({
        sub: session.sub,
        role: "SELLER",
        name: session.name,
      });
    }
  }

  revalidatePath("/seller/onboarding");
  redirect("/seller/onboarding");
}

const productSchema = z.object({
  title: z.string().min(2, "상품명을 입력하세요."),
  categoryId: z.string().min(1, "카테고리를 선택하세요."),
  priceKrw: z.coerce.number().int().positive("가격은 양의 정수여야 합니다."),
  stockQty: z.coerce.number().int().min(0, "재고는 0 이상이어야 합니다."),
  originRegion: z.string().min(1, "원산지를 입력하세요."),
  description: z.string().optional(),
});

export async function createProductAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/products/new");

  const seller = await prisma.seller.findUnique({
    where: { userId: session.sub },
    include: { applications: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!seller) {
    return { error: "입점 심사를 먼저 신청하세요." };
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    priceKrw: formData.get("priceKrw"),
    stockQty: formData.get("stockQty"),
    originRegion: formData.get("originRegion"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const approved = seller.applications[0]?.status === "APPROVED";
  const slug = `${slugify(parsed.data.title)}-${randomSuffix()}`;

  await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: parsed.data.categoryId,
      slug,
      title: parsed.data.title,
      priceKrw: parsed.data.priceKrw,
      stockQty: parsed.data.stockQty,
      originRegion: parsed.data.originRegion,
      description: parsed.data.description || null,
      status: approved ? "ON_SALE" : "DRAFT",
    },
  });

  revalidatePath("/seller/products");
  redirect("/seller/products");
}
