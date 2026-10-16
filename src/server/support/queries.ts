import "server-only";
import { prisma } from "@/lib/db";

const THREAD_INCLUDE = {
  user: true,
  seller: true,
  product: true,
  order: true,
  messages: { include: { author: true }, orderBy: { createdAt: "asc" as const } },
};

export async function getTicketDetail(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: THREAD_INCLUDE,
  });
}

export async function listMyTickets(userId: string) {
  return prisma.supportTicket.findMany({
    where: { userId },
    include: { product: true, order: true, seller: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSellerTickets(sellerId: string) {
  return prisma.supportTicket.findMany({
    where: { sellerId },
    include: { user: true, product: true, order: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllTicketsForAdmin() {
  return prisma.supportTicket.findMany({
    include: { user: true, seller: true, product: true, order: true },
    orderBy: { createdAt: "desc" },
  });
}

/** 상품 상세페이지에 노출할 공개 상품질문(+답변)만 조회. */
export async function listPublicProductQuestions(productId: string) {
  return prisma.supportTicket.findMany({
    where: { productId, category: "PRODUCT_QUESTION", isPublic: true },
    include: { user: true, messages: { include: { author: true }, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

/** "주문/분쟁 문의" 작성 시 선택할 수 있는, 본인 주문의 품목 목록(판매자 식별용). */
export async function listOrderItemsForTicket(orderId: string, buyerId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { suborders: { include: { seller: true, items: { include: { product: true } } } } },
  });
  if (!order || order.buyerId !== buyerId) return null;
  return order;
}
