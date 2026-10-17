"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify, randomSuffix } from "@/lib/slug";
import { getSession } from "@/server/session";
import { logAdminAction } from "@/server/audit/log";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

export async function approveApplicationAction(
  applicationId: string
): Promise<void> {
  const session = await requireAdmin();

  const application = await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
      reviewedBy: session.sub,
      reviewedAt: new Date(),
    },
    include: { seller: true },
  });

  // 승인 시 기존 임시저장(DRAFT) 상품을 판매중으로 전환한다.
  // 대리등록 상품(isProxyRegistered)은 별도의 관리자 최종 승인(approveProxyProductAction)이
  // 있어야만 판매중으로 전환된다 — 입점 승인과 묶어서 자동 전환하지 않는다(마스터 문서 10.3절).
  await prisma.product.updateMany({
    where: {
      sellerId: application.sellerId,
      status: "DRAFT",
      isProxyRegistered: false,
    },
    data: { status: "ON_SALE" },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "SELLER_APPLICATION_APPROVED",
    targetType: "SellerApplication",
    targetId: applicationId,
    detail: application.seller.storeName,
  });

  revalidatePath("/admin/sellers");
}

export async function rejectApplicationAction(
  applicationId: string
): Promise<void> {
  const session = await requireAdmin();

  const application = await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewedBy: session.sub,
      reviewedAt: new Date(),
    },
    include: { seller: true },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "SELLER_APPLICATION_REJECTED",
    targetType: "SellerApplication",
    targetId: applicationId,
    detail: application.seller.storeName,
  });

  revalidatePath("/admin/sellers");
}

export type ProxyProductFormState = { error?: string } | undefined;

const proxyProductSchema = z.object({
  sellerId: z.string().min(1, "농가(판매자)를 선택하세요."),
  title: z.string().min(2, "상품명을 입력하세요."),
  categoryId: z.string().min(1, "카테고리를 선택하세요."),
  priceKrw: z.coerce.number().int().positive("가격은 양의 정수여야 합니다."),
  stockQty: z.coerce.number().int().min(0, "재고는 0 이상이어야 합니다."),
  originRegion: z.string().min(1, "원산지를 입력하세요."),
  description: z.string().optional(),
  proxySourceNote: z.string().min(2, "상품 정보의 출처(전달 경로)를 입력하세요."),
});

/// 운영자가 특정 농가를 대신해 상품을 등록한다(마스터 문서 10.3절).
/// 농가의 입점 승인 여부와 무관하게 항상 DRAFT로 생성되며, 반드시 관리자의 별도 최종 승인
/// (approveProxyProductAction)이 있어야 구매자에게 노출된다 — "무단 게시 금지" 요건을 코드로 강제.
export async function createProxyProductAction(
  _prevState: ProxyProductFormState,
  formData: FormData
): Promise<ProxyProductFormState> {
  const session = await requireAdmin();

  const parsed = proxyProductSchema.safeParse({
    sellerId: formData.get("sellerId"),
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    priceKrw: formData.get("priceKrw"),
    stockQty: formData.get("stockQty"),
    originRegion: formData.get("originRegion"),
    description: formData.get("description") ?? undefined,
    proxySourceNote: formData.get("proxySourceNote"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }
  if (formData.get("consentConfirmed") !== "on") {
    return { error: "농가의 사전 동의를 확인했는지 체크해 주세요." };
  }

  const seller = await prisma.seller.findUnique({ where: { id: parsed.data.sellerId } });
  if (!seller) {
    return { error: "선택한 농가를 찾을 수 없습니다." };
  }

  const slug = `${slugify(parsed.data.title)}-${randomSuffix()}`;
  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: parsed.data.categoryId,
      slug,
      title: parsed.data.title,
      priceKrw: parsed.data.priceKrw,
      stockQty: parsed.data.stockQty,
      originRegion: parsed.data.originRegion,
      description: parsed.data.description || null,
      status: "DRAFT",
      isProxyRegistered: true,
      proxySourceNote: parsed.data.proxySourceNote,
      proxyConsentAt: new Date(),
      proxyRegisteredBy: session.sub,
    },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "PROXY_PRODUCT_CREATED",
    targetType: "Product",
    targetId: product.id,
    detail: `${seller.storeName} - ${product.title}`,
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function approveProxyProductAction(productId: string): Promise<void> {
  const session = await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isProxyRegistered || product.status !== "DRAFT") return;

  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "ON_SALE",
      proxyApprovedAt: new Date(),
      proxyApprovedBy: session.sub,
    },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "PROXY_PRODUCT_APPROVED",
    targetType: "Product",
    targetId: productId,
    detail: product.title,
  });

  revalidatePath("/admin/products");
}

export async function deleteProxyProductAction(productId: string): Promise<void> {
  const session = await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isProxyRegistered || product.status !== "DRAFT") return;

  await prisma.product.delete({ where: { id: productId } });

  await logAdminAction({
    actorId: session.sub,
    action: "PROXY_PRODUCT_DELETED",
    targetType: "Product",
    targetId: productId,
    detail: product.title,
  });

  revalidatePath("/admin/products");
}
