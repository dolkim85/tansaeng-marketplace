"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import {
  BLOCK_TYPES,
  parseBlockContent,
  parseFaqLines,
  parseTableLines,
  type ProductBlockType,
} from "@/lib/productBlocks";

export type BlockFormState = { error?: string } | undefined;

async function assertOwnsProduct(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true },
  });
  if (!product || product.seller.userId !== userId) {
    throw new Error("NOT_OWNER");
  }
  return product;
}

const typeSchema = z.enum(BLOCK_TYPES as [ProductBlockType, ...ProductBlockType[]]);

async function buildRawContent(
  type: ProductBlockType,
  productId: string,
  formData: FormData
): Promise<{ error: string } | { raw: unknown }> {
  switch (type) {
    case "HEADING":
    case "PARAGRAPH":
      return { raw: { text: formData.get("text") } };

    case "IMAGE":
    case "VIDEO": {
      const mediaId = formData.get("mediaId");
      if (typeof mediaId !== "string" || !mediaId) {
        return { error: "미디어를 선택하세요." };
      }
      const media = await prisma.productMedia.findUnique({ where: { id: mediaId } });
      const expectedKind = type === "IMAGE" ? "image" : "video";
      if (!media || media.productId !== productId || media.kind !== expectedKind) {
        return { error: "선택한 미디어를 찾을 수 없습니다." };
      }
      return { raw: { mediaId } };
    }

    case "TABLE": {
      const rowsText = formData.get("rowsText");
      if (typeof rowsText !== "string") return { error: "표 내용을 입력하세요." };
      return {
        raw: {
          hasHeader: formData.get("hasHeader") === "on",
          rows: parseTableLines(rowsText),
        },
      };
    }

    case "DIVIDER":
      return { raw: {} };

    case "FAQ": {
      const faqText = formData.get("faqText");
      if (typeof faqText !== "string") return { error: "FAQ 내용을 입력하세요." };
      return { raw: { items: parseFaqLines(faqText) } };
    }

    case "BANNER":
      return {
        raw: {
          text: formData.get("text"),
          tone: formData.get("tone") === "warning" ? "warning" : "info",
        },
      };
  }
}

export async function addBlockAction(
  productId: string,
  _prevState: BlockFormState,
  formData: FormData
): Promise<BlockFormState> {
  const session = await getSession();
  if (!session) return { error: "로그인이 필요합니다." };

  let product;
  try {
    product = await assertOwnsProduct(productId, session.sub);
  } catch {
    return { error: "본인 상품만 수정할 수 있습니다." };
  }

  const typeParsed = typeSchema.safeParse(formData.get("type"));
  if (!typeParsed.success) {
    return { error: "블록 종류를 확인하세요." };
  }
  const type = typeParsed.data;

  const built = await buildRawContent(type, productId, formData);
  if ("error" in built) return { error: built.error };

  const parsed = parseBlockContent(type, built.raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const maxOrder = await prisma.productContentBlock.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  await prisma.productContentBlock.create({
    data: {
      productId,
      type,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      content: JSON.stringify(parsed.data),
    },
  });

  revalidatePath(`/seller/products/${productId}/edit`);
  revalidatePath(`/products/${product.slug}`);
  return undefined;
}

export async function deleteBlockAction(blockId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const block = await prisma.productContentBlock.findUnique({
    where: { id: blockId },
    include: { product: { include: { seller: true } } },
  });
  if (!block || block.product.seller.userId !== session.sub) return;

  await prisma.productContentBlock.delete({ where: { id: blockId } });

  revalidatePath(`/seller/products/${block.productId}/edit`);
  revalidatePath(`/products/${block.product.slug}`);
}

export async function moveBlockAction(
  blockId: string,
  direction: "up" | "down"
): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const block = await prisma.productContentBlock.findUnique({
    where: { id: blockId },
    include: { product: { include: { seller: true } } },
  });
  if (!block || block.product.seller.userId !== session.sub) return;

  const neighbor = await prisma.productContentBlock.findFirst({
    where: {
      productId: block.productId,
      sortOrder: direction === "up" ? { lt: block.sortOrder } : { gt: block.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await prisma.$transaction([
    prisma.productContentBlock.update({
      where: { id: block.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.productContentBlock.update({
      where: { id: neighbor.id },
      data: { sortOrder: block.sortOrder },
    }),
  ]);

  revalidatePath(`/seller/products/${block.productId}/edit`);
  revalidatePath(`/products/${block.product.slug}`);
}
