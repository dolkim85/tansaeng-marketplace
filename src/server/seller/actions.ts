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

  // 입점 승인과 별개로, 카테고리별 판매 허가가 APPROVED여야만 그 카테고리에 상품을 등록할 수
  // 있다(마스터 문서 10.2절 5번 — "품목별 판매 가능 카테고리... 부여").
  const categoryPermission = await prisma.sellerCategoryPermission.findUnique({
    where: {
      sellerId_categoryId: { sellerId: seller.id, categoryId: parsed.data.categoryId },
    },
  });
  if (categoryPermission?.status !== "APPROVED") {
    return {
      error:
        "이 카테고리는 아직 판매 허가를 받지 않았습니다. /seller/onboarding에서 카테고리 판매 허가를 먼저 요청하세요.",
    };
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

const updateProductSchema = z.object({
  title: z.string().min(2, "상품명을 입력하세요."),
  categoryId: z.string().min(1, "카테고리를 선택하세요."),
  priceKrw: z.coerce.number().int().positive("가격은 양의 정수여야 합니다."),
  stockQty: z.coerce.number().int().min(0, "재고는 0 이상이어야 합니다."),
  originRegion: z.string().min(1, "원산지를 입력하세요."),
  description: z.string().optional(),
});

/// 상품 등록 후 기본 정보(상품명/카테고리/가격/재고/원산지/설명)를 수정한다. slug는 공개
/// URL·사이트맵에 이미 노출되어 있을 수 있어 제목이 바뀌어도 그대로 유지한다(URL 불변).
/// 카테고리를 변경하는 경우에도 createProductAction과 동일하게 APPROVED 판매 허가가 필요하다.
export async function updateProductAction(
  productId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/products");

  const seller = await prisma.seller.findUnique({ where: { userId: session.sub } });
  if (!seller) return { error: "판매자 정보가 없습니다." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.sellerId !== seller.id) {
    return { error: "본인 상품만 수정할 수 있습니다." };
  }

  const parsed = updateProductSchema.safeParse({
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

  if (parsed.data.categoryId !== product.categoryId) {
    const categoryPermission = await prisma.sellerCategoryPermission.findUnique({
      where: {
        sellerId_categoryId: { sellerId: seller.id, categoryId: parsed.data.categoryId },
      },
    });
    if (categoryPermission?.status !== "APPROVED") {
      return {
        error:
          "이 카테고리는 아직 판매 허가를 받지 않았습니다. /seller/onboarding에서 카테고리 판매 허가를 먼저 요청하세요.",
      };
    }
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: parsed.data.title,
      categoryId: parsed.data.categoryId,
      priceKrw: parsed.data.priceKrw,
      stockQty: parsed.data.stockQty,
      originRegion: parsed.data.originRegion,
      description: parsed.data.description || null,
    },
  });

  revalidatePath(`/seller/products/${productId}/edit`);
  revalidatePath("/seller/products");
  revalidatePath(`/products/${product.slug}`);
  return undefined;
}

/// 농가가 자신의(대리등록 포함) 상품 판매를 즉시 중단/재개한다(마스터 문서 10.3절
/// "농가가... 판매 중단을 요청할 수 있게 하며" 요건의 최소 구현 — 승인 대기열 없이 즉시 반영).
async function setSellingState(productId: string, nextStatus: "ON_SALE" | "HIDDEN") {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/products");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  const seller = await prisma.seller.findUnique({ where: { userId: session.sub } });
  if (!product || !seller || product.sellerId !== seller.id) return;
  if (product.status !== "ON_SALE" && product.status !== "HIDDEN") return;

  await prisma.product.update({
    where: { id: productId },
    data: { status: nextStatus },
  });
  revalidatePath("/seller/products");
}

export async function stopSellingProductAction(productId: string): Promise<void> {
  await setSellingState(productId, "HIDDEN");
}

export async function resumeSellingProductAction(productId: string): Promise<void> {
  await setSellingState(productId, "ON_SALE");
}
