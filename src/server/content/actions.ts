"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

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
  await requireAdmin();

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  await prisma.banner.create({ data: parsed.data });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return undefined;
}

export async function toggleBannerActiveAction(bannerId: string): Promise<void> {
  await requireAdmin();
  const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
  if (!banner) return;
  await prisma.banner.update({
    where: { id: bannerId },
    data: { isActive: !banner.isActive },
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function deleteBannerAction(bannerId: string): Promise<void> {
  await requireAdmin();
  await prisma.banner.delete({ where: { id: bannerId } });
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
  await requireAdmin();

  const parsed = noticeSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isPinned: formData.get("isPinned") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  await prisma.notice.create({ data: parsed.data });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return undefined;
}

export async function deleteNoticeAction(noticeId: string): Promise<void> {
  await requireAdmin();
  await prisma.notice.delete({ where: { id: noticeId } });
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
  await requireAdmin();

  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  await prisma.faq.create({ data: parsed.data });
  revalidatePath("/admin/content");
  revalidatePath("/help");
  return undefined;
}

export async function deleteFaqAction(faqId: string): Promise<void> {
  await requireAdmin();
  await prisma.faq.delete({ where: { id: faqId } });
  revalidatePath("/admin/content");
  revalidatePath("/help");
}
