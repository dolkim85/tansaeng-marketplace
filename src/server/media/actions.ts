"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import {
  detectFileKind,
  MAX_IMAGES_PER_PRODUCT,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEOS_PER_PRODUCT,
} from "@/server/media/validate";

export type MediaFormState = { error?: string } | undefined;

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "products");

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

export async function uploadProductMediaAction(
  productId: string,
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const session = await getSession();
  if (!session) return { error: "로그인이 필요합니다." };

  let product;
  try {
    product = await assertOwnsProduct(productId, session.sub);
  } catch {
    return { error: "본인 상품만 수정할 수 있습니다." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "파일을 선택하세요." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const kind = detectFileKind(buffer);

  if (!kind) {
    return {
      error:
        "지원하지 않는 파일 형식입니다 (JPEG/PNG/WebP 사진, MP4/WebM 영상만 허용).",
    };
  }

  const isVideo = kind.startsWith("video/");

  if (isVideo) {
    if (buffer.length > MAX_VIDEO_BYTES) {
      return { error: "영상 용량은 80MB를 초과할 수 없습니다." };
    }
    const videoCount = await prisma.productMedia.count({
      where: { productId, kind: "video" },
    });
    if (videoCount >= MAX_VIDEOS_PER_PRODUCT) {
      return { error: "영상은 상품당 1개만 등록할 수 있습니다." };
    }
  } else {
    if (buffer.length > MAX_IMAGE_BYTES) {
      return { error: "사진 용량은 8MB를 초과할 수 없습니다." };
    }
    const imageCount = await prisma.productMedia.count({
      where: { productId, kind: "image" },
    });
    if (imageCount >= MAX_IMAGES_PER_PRODUCT) {
      return { error: `사진은 상품당 최대 ${MAX_IMAGES_PER_PRODUCT}장까지 등록할 수 있습니다.` };
    }
  }

  const dir = path.join(UPLOAD_ROOT, productId);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let finalBuffer: Buffer;
  let ext: string;

  if (isVideo) {
    finalBuffer = buffer;
    ext = kind === "video/mp4" ? "mp4" : "webm";
  } else {
    // sharp로 재인코딩하면서 EXIF 등 메타데이터가 자동으로 제거되고(withMetadata 호출 안 함),
    // 큰 이미지는 리사이즈된다. 결과는 JPEG로 통일한다.
    finalBuffer = await sharp(buffer)
      .rotate() // EXIF orientation을 픽셀에 반영한 뒤 메타데이터는 버림
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    ext = "jpg";
  }

  const fullFilename = `${filename}.${ext}`;
  await writeFile(path.join(dir, fullFilename), finalBuffer);

  const maxOrder = await prisma.productMedia.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  await prisma.productMedia.create({
    data: {
      productId,
      kind: isVideo ? "video" : "image",
      url: `/uploads/products/${productId}/${fullFilename}`,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/seller/products/${productId}/edit`);
  revalidatePath(`/products/${product.slug}`);
  return undefined;
}

export async function deleteProductMediaAction(mediaId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: { include: { seller: true } } },
  });
  if (!media || media.product.seller.userId !== session.sub) return;

  await prisma.productMedia.delete({ where: { id: mediaId } });

  const filePath = path.join(process.cwd(), "public", media.url);
  await unlink(filePath).catch(() => {});

  revalidatePath(`/seller/products/${media.productId}/edit`);
  revalidatePath(`/products/${media.product.slug}`);
}

export async function setPrimaryMediaAction(mediaId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const media = await prisma.productMedia.findUnique({
    where: { id: mediaId },
    include: { product: { include: { seller: true } } },
  });
  if (!media || media.product.seller.userId !== session.sub) return;
  if (media.kind !== "image") return;

  const currentPrimary = await prisma.productMedia.findFirst({
    where: { productId: media.productId, kind: "image", sortOrder: 0 },
  });

  await prisma.$transaction(async (tx) => {
    if (currentPrimary && currentPrimary.id !== media.id) {
      await tx.productMedia.update({
        where: { id: currentPrimary.id },
        data: { sortOrder: media.sortOrder },
      });
    }
    await tx.productMedia.update({
      where: { id: media.id },
      data: { sortOrder: 0 },
    });
  });

  revalidatePath(`/seller/products/${media.productId}/edit`);
  revalidatePath(`/products/${media.product.slug}`);
}
