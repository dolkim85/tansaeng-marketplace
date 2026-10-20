"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { logAdminAction } from "@/server/audit/log";
import { logNotification } from "@/server/notifications/log";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export type TicketFormState = { error?: string } | undefined;

const newTicketSchema = z.object({
  subject: z.string().min(2, "제목을 2자 이상 입력하세요."),
  body: z.string().min(2, "내용을 2자 이상 입력하세요."),
});

export async function createProductQuestionAction(
  productId: string,
  _prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> {
  const session = await getSession();
  if (!session) redirect(`/auth/login?from=/products`);

  const parsed = newTicketSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "상품을 찾을 수 없습니다." };

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.sub,
      category: "PRODUCT_QUESTION",
      subject: parsed.data.subject,
      isPublic: formData.get("isPublic") === "on",
      productId: product.id,
      sellerId: product.sellerId,
      messages: {
        create: {
          authorId: session.sub,
          authorRole: session.role,
          body: parsed.data.body,
        },
      },
    },
  });

  revalidatePath("/help");
  revalidatePath(`/products/${product.slug}`);
  redirect(`/help/${ticket.id}`);
}

const newOrderTicketSchema = z.object({
  category: z.enum(["ORDER_INQUIRY", "DISPUTE"]),
  orderItemId: z.string().min(1, "문의할 상품을 선택하세요."),
  subject: z.string().min(2, "제목을 2자 이상 입력하세요."),
  body: z.string().min(2, "내용을 2자 이상 입력하세요."),
});

export async function createOrderTicketAction(
  orderId: string,
  _prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> {
  const session = await getSession();
  if (!session) redirect(`/auth/login?from=/orders`);

  const parsed = newOrderTicketSchema.safeParse({
    category: formData.get("category"),
    orderItemId: formData.get("orderItemId"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { suborders: { include: { items: true } } },
  });
  if (!order || order.buyerId !== session.sub) {
    return { error: "본인 주문만 문의할 수 있습니다." };
  }

  const suborder = order.suborders.find((sub) =>
    sub.items.some((item) => item.id === parsed.data.orderItemId)
  );
  const orderItem = suborder?.items.find((item) => item.id === parsed.data.orderItemId);
  if (!suborder || !orderItem) {
    return { error: "해당 주문에서 상품을 찾을 수 없습니다." };
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.sub,
      category: parsed.data.category,
      subject: parsed.data.subject,
      orderId: order.id,
      productId: orderItem.productId,
      sellerId: suborder.sellerId,
      messages: {
        create: {
          authorId: session.sub,
          authorRole: session.role,
          body: parsed.data.body,
        },
      },
    },
  });

  revalidatePath("/help");
  revalidatePath(`/orders/${order.id}`);
  redirect(`/help/${ticket.id}`);
}

async function assertCanAccessTicket(ticketId: string) {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/help");

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { seller: true },
  });
  if (!ticket) redirect("/help");

  const isOwner = ticket.userId === session.sub;
  const isAssignedSeller = ticket.seller?.userId === session.sub;
  const isAdmin = ADMIN_ROLES.has(session.role);
  if (!isOwner && !isAssignedSeller && !isAdmin) redirect("/help");

  return { session, ticket, isOwner, isAssignedSeller, isAdmin };
}

const replySchema = z.object({
  body: z.string().min(2, "답변 내용을 2자 이상 입력하세요."),
});

export async function replyTicketAction(
  ticketId: string,
  _prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> {
  const { session, ticket, isOwner, isAdmin } = await assertCanAccessTicket(ticketId);
  if (ticket.status === "CLOSED") {
    return { error: "종료된 문의에는 답변할 수 없습니다." };
  }

  const parsed = replySchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  await prisma.supportTicketMessage.create({
    data: {
      ticketId,
      authorId: session.sub,
      authorRole: session.role,
      body: parsed.data.body,
    },
  });
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: isOwner ? "OPEN" : "ANSWERED" },
  });

  if (isAdmin) {
    await logAdminAction({
      actorId: session.sub,
      action: "SUPPORT_TICKET_REPLIED",
      targetType: "SupportTicket",
      targetId: ticketId,
      detail: ticket.subject,
    });
  }

  // 티켓 소유자(구매자) 본인이 다시 질문을 추가한 경우는 알림 대상이 아님 — 자신이 쓴
  // 글을 자신에게 "답변"으로 알릴 이유가 없다. 판매자/관리자가 답했을 때만 알린다.
  if (!isOwner) {
    await logNotification({
      userId: ticket.userId,
      type: "SUPPORT_TICKET_REPLIED",
      subject: "문의에 답변이 등록되었습니다",
      body: `"${ticket.subject}" 문의에 답변이 등록되었습니다.`,
    });
  }

  revalidatePath(`/help/${ticketId}`);
  revalidatePath(`/seller/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return undefined;
}

export async function closeTicketAction(ticketId: string): Promise<void> {
  const { session, ticket, isAdmin } = await assertCanAccessTicket(ticketId);
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
  });

  if (isAdmin) {
    await logAdminAction({
      actorId: session.sub,
      action: "SUPPORT_TICKET_CLOSED",
      targetType: "SupportTicket",
      targetId: ticketId,
      detail: ticket.subject,
    });
  }

  revalidatePath(`/help/${ticketId}`);
  revalidatePath("/help");
  revalidatePath("/seller/support");
  revalidatePath("/admin/support");
}
