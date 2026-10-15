import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo1234";

async function upsertUser(params: {
  email: string;
  name: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  status?: "APPROVED" | "PENDING";
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      email: params.email,
      name: params.name,
      role: params.role,
      status: params.status ?? "APPROVED",
      passwordHash,
    },
  });
}

async function main() {
  console.log("=== 시드 시작 ===");

  const buyer = await upsertUser({
    email: "buyer_demo@tansaeng.local",
    name: "구매자데모",
    role: "BUYER",
  });

  const sellerPendingUser = await upsertUser({
    email: "seller_pending@tansaeng.local",
    name: "입점대기농가",
    role: "SELLER",
  });

  const sellerApprovedUser = await upsertUser({
    email: "seller_approved@tansaeng.local",
    name: "승인된농가",
    role: "SELLER",
  });

  const admin = await upsertUser({
    email: "admin_demo@tansaeng.local",
    name: "운영자데모",
    role: "ADMIN",
  });

  const sellerPending = await prisma.seller.upsert({
    where: { userId: sellerPendingUser.id },
    update: {},
    create: {
      userId: sellerPendingUser.id,
      storeName: "입점대기농장",
      storeSlug: "pending-farm",
      identityType: "FARM_ENTITY_ONLY",
      applications: {
        create: { status: "SUBMITTED" },
      },
    },
  });

  const sellerApproved = await prisma.seller.upsert({
    where: { userId: sellerApprovedUser.id },
    update: {},
    create: {
      userId: sellerApprovedUser.id,
      storeName: "승인된농장",
      storeSlug: "approved-farm",
      identityType: "BUSINESS_PRODUCER",
      applications: {
        create: {
          status: "APPROVED",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      },
    },
  });

  const agriculture = await prisma.category.upsert({
    where: { slug: "agriculture" },
    update: {},
    create: { slug: "agriculture", name: "농산물" },
  });
  const vegetables = await prisma.category.upsert({
    where: { slug: "vegetables" },
    update: {},
    create: { slug: "vegetables", name: "채소", parentId: agriculture.id },
  });
  await prisma.category.upsert({
    where: { slug: "livestock" },
    update: {},
    create: { slug: "livestock", name: "축산물" },
  });
  const livestock = await prisma.category.findUniqueOrThrow({
    where: { slug: "livestock" },
  });
  await prisma.category.upsert({
    where: { slug: "seafood" },
    update: {},
    create: { slug: "seafood", name: "수산물" },
  });

  const products = [
    {
      slug: "potato-10kg",
      title: "무농약 감자 10kg",
      categoryId: vegetables.id,
      priceKrw: 25000,
      stockQty: 50,
      originRegion: "강원 평창",
    },
    {
      slug: "onion-5kg",
      title: "햇양파 5kg",
      categoryId: vegetables.id,
      priceKrw: 12000,
      stockQty: 100,
      originRegion: "전남 무안",
    },
    {
      slug: "hanwoo-sirloin-500g",
      title: "한우 등심 1++ 500g",
      categoryId: livestock.id,
      priceKrw: 68000,
      stockQty: 20,
      originRegion: "경북 안동",
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        sellerId: sellerApproved.id,
        status: "ON_SALE",
        description: `${p.title} - 산지에서 직접 배송됩니다. (시드 데이터)`,
      },
    });
  }

  const potato = await prisma.product.findUniqueOrThrow({
    where: { slug: "potato-10kg" },
  });
  await prisma.wishlist.upsert({
    where: { userId_productId: { userId: buyer.id, productId: potato.id } },
    update: {},
    create: { userId: buyer.id, productId: potato.id },
  });
  await prisma.sellerFollow.upsert({
    where: {
      userId_sellerId: { userId: buyer.id, sellerId: sellerApproved.id },
    },
    update: {},
    create: { userId: buyer.id, sellerId: sellerApproved.id },
  });

  console.log("=== 시드 완료 ===");
  console.log("데모 계정 비밀번호(전체 공통):", DEMO_PASSWORD);
  console.log("- buyer_demo@tansaeng.local (구매자)");
  console.log("- seller_pending@tansaeng.local (판매자, 입점 심사중)");
  console.log("- seller_approved@tansaeng.local (판매자, 승인됨)");
  console.log("- admin_demo@tansaeng.local (관리자)");
  console.log("sellerPending id:", sellerPending.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
