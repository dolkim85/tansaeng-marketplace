"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { logAdminAction } from "@/server/audit/log";
import { slugify } from "@/lib/slug";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

export type CategoryFormState = { error?: string } | undefined;

const createCategorySchema = z.object({
  name: z.string().min(1, "카테고리 이름을 입력하세요.").max(50),
  slug: z.string().max(60).optional(),
  parentId: z.string().optional(),
});

/// 카테고리 생성(마스터 문서 10.2절 "품목별 판매 가능 카테고리" 운용을 위한 전제 작업).
/// 2단계 트리만 지원하므로, 상위로 지정하는 카테고리는 반드시 parentId가 없는(최상위)
/// 카테고리여야 한다 — 그래야 getCategoryWithProducts 등 기존 조회 로직(최상위+직계 자식만
/// 가정)이 깨지지 않는다.
export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await requireAdmin();

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent) return { error: "상위 카테고리를 찾을 수 없습니다." };
    if (parent.parentId !== null) {
      return { error: "하위 카테고리 아래에는 추가로 카테고리를 만들 수 없습니다(최대 2단계)." };
    }
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) {
    return { error: "이름 또는 슬러그에서 유효한 슬러그를 만들 수 없습니다." };
  }
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { error: "같은 슬러그의 카테고리가 이미 있습니다. 이름이나 슬러그를 다르게 입력하세요." };
  }

  const category = await prisma.category.create({
    data: { name: parsed.data.name, slug, parentId: parsed.data.parentId ?? null },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "CATEGORY_CREATED",
    targetType: "Category",
    targetId: category.id,
    detail: category.name,
  });

  revalidatePath("/admin/content");
  revalidatePath("/categories");
  return undefined;
}

const renameCategorySchema = z.object({
  name: z.string().min(1, "카테고리 이름을 입력하세요.").max(50),
});

/// 이름만 수정 가능, slug는 고정한다. 공개 카테고리 URL(/category/[slug])이 이미
/// sitemap.xml에 등록되어 있을 수 있어, 상품 slug와 동일한 이유로 불변 처리한다.
export async function renameCategoryAction(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await requireAdmin();

  const parsed = renameCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "CATEGORY_RENAMED",
    targetType: "Category",
    targetId: categoryId,
    detail: category.name,
  });

  revalidatePath("/admin/content");
  revalidatePath("/categories");
  revalidatePath(`/category/${category.slug}`);
  return undefined;
}

/// 하위 카테고리나 상품이 하나라도 연결되어 있으면 삭제를 거부한다(판매 중인 상품의
/// 카테고리가 갑자기 사라지는 사고 방지). UI에서도 이 조건을 미리 확인해 삭제 버튼 자체를
/// 숨기지만, 직접 폼을 제출하는 경로까지 막기 위해 서버에서도 동일하게 재검증한다.
export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const session = await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { children: true, products: true } } },
  });
  if (!category) return;
  if (category._count.children > 0 || category._count.products > 0) return;

  await prisma.category.delete({ where: { id: categoryId } });

  await logAdminAction({
    actorId: session.sub,
    action: "CATEGORY_DELETED",
    targetType: "Category",
    targetId: categoryId,
    detail: category.name,
  });

  revalidatePath("/admin/content");
  revalidatePath("/categories");
}
