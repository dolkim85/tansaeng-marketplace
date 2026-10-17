"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
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

export type ContentFormState = { error?: string } | undefined;

const bannerSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요."),
  subtitle: z.string().optional(),
  linkUrl: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createBannerAction(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const session = await requireAdmin();

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const banner = await prisma.banner.create({ data: parsed.data });
  await logAdminAction({
    actorId: session.sub,
    action: "BANNER_CREATED",
    targetType: "Banner",
    targetId: banner.id,
    detail: banner.title,
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
  return undefined;
}

export async function toggleBannerActiveAction(bannerId: string): Promise<void> {
  const session = await requireAdmin();
  const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
  if (!banner) return;
  await prisma.banner.update({
    where: { id: bannerId },
    data: { isActive: !banner.isActive },
  });
  await logAdminAction({
    actorId: session.sub,
    action: "BANNER_TOGGLED",
    targetType: "Banner",
    targetId: bannerId,
    detail: `${banner.title} → ${banner.isActive ? "비활성" : "활성"}`,
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function deleteBannerAction(bannerId: string): Promise<void> {
  const session = await requireAdmin();
  const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
  if (!banner) return;
  await prisma.banner.delete({ where: { id: bannerId } });
  await logAdminAction({
    actorId: session.sub,
    action: "BANNER_DELETED",
    targetType: "Banner",
    targetId: bannerId,
    detail: banner.title,
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

const noticeSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요."),
  body: z.string().min(1, "내용을 입력하세요."),
  isPinned: z.boolean().default(false),
});

export async function createNoticeAction(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const session = await requireAdmin();

  const parsed = noticeSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isPinned: formData.get("isPinned") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const notice = await prisma.notice.create({ data: parsed.data });
  await logAdminAction({
    actorId: session.sub,
    action: "NOTICE_CREATED",
    targetType: "Notice",
    targetId: notice.id,
    detail: notice.title,
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
  return undefined;
}

export async function deleteNoticeAction(noticeId: string): Promise<void> {
  const session = await requireAdmin();
  const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
  if (!notice) return;
  await prisma.notice.delete({ where: { id: noticeId } });
  await logAdminAction({
    actorId: session.sub,
    action: "NOTICE_DELETED",
    targetType: "Notice",
    targetId: noticeId,
    detail: notice.title,
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

const faqSchema = z.object({
  question: z.string().min(1, "질문을 입력하세요."),
  answer: z.string().min(1, "답변을 입력하세요."),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createFaqAction(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const session = await requireAdmin();

  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const faq = await prisma.faq.create({ data: parsed.data });
  await logAdminAction({
    actorId: session.sub,
    action: "FAQ_CREATED",
    targetType: "Faq",
    targetId: faq.id,
    detail: faq.question,
  });

  revalidatePath("/admin/content");
  revalidatePath("/help");
  return undefined;
}

export async function deleteFaqAction(faqId: string): Promise<void> {
  const session = await requireAdmin();
  const faq = await prisma.faq.findUnique({ where: { id: faqId } });
  if (!faq) return;
  await prisma.faq.delete({ where: { id: faqId } });
  await logAdminAction({
    actorId: session.sub,
    action: "FAQ_DELETED",
    targetType: "Faq",
    targetId: faqId,
    detail: faq.question,
  });
  revalidatePath("/admin/content");
  revalidatePath("/help");
}
