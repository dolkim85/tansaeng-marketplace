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

  const onion = await prisma.product.findUniqueOrThrow({
    where: { slug: "onion-5kg" },
  });
  const hanwoo = await prisma.product.findUniqueOrThrow({
    where: { slug: "hanwoo-sirloin-500g" },
  });
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  await prisma.groupBuy.upsert({
    where: { productId: onion.id },
    update: {},
    create: {
      productId: onion.id,
      title: "햇양파 5kg 공동구매",
      targetQty: 50,
      maxQty: 80,
      perUserLimit: 5,
      priceKrw: 10000,
      teaserStartAt: new Date(now - 8 * day),
      openAt: new Date(now - 1 * day),
      closeAt: new Date(now + 6 * day),
      expectedShipAt: new Date(now + 9 * day),
    },
  });

  await prisma.groupBuy.upsert({
    where: { productId: hanwoo.id },
    update: {},
    create: {
      productId: hanwoo.id,
      title: "한우 등심 1++ 공동구매",
      targetQty: 30,
      maxQty: 50,
      perUserLimit: 0,
      priceKrw: 62000,
      teaserStartAt: new Date(now - 1 * day),
      openAt: new Date(now + 3 * day),
      closeAt: new Date(now + 10 * day),
      expectedShipAt: new Date(now + 13 * day),
    },
  });

  const existingBannerAd = await prisma.ad.findFirst({
    where: { productId: potato.id, placement: "HOME_BANNER" },
  });
  if (!existingBannerAd) {
    await prisma.ad.create({
      data: {
        sellerId: sellerApproved.id,
        productId: potato.id,
        placement: "HOME_BANNER",
        status: "APPROVED",
        startAt: new Date(now - 1 * day),
        endAt: new Date(now + 13 * day),
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    });
  }

  const existingBanner = await prisma.banner.findFirst({
    where: { title: "이번 주 공동구매, 산지에서 바로" },
  });
  if (!existingBanner) {
    await prisma.banner.create({
      data: {
        title: "이번 주 공동구매, 산지에서 바로",
        subtitle: "햇양파·한우 공동구매 진행 중",
        linkUrl: "/group-buys",
        sortOrder: 0,
      },
    });
  }

  const existingNotice = await prisma.notice.findFirst({
    where: { title: "탄생 마켓플레이스를 시작합니다" },
  });
  if (!existingNotice) {
    await prisma.notice.create({
      data: {
        title: "탄생 마켓플레이스를 시작합니다",
        body: "산지 직송·공동구매 플랫폼 탄생이 로컬 개발 단계로 오픈했습니다. 이용 중 불편사항은 고객센터로 문의해 주세요.",
        isPinned: true,
      },
    });
  }

  const faqSeeds = [
    {
      question: "주문 후 배송까지 얼마나 걸리나요?",
      answer:
        "일반 주문은 판매자가 접수 후 순차 처리합니다. 공동구매는 상품마다 표시된 출하예정일을 따릅니다.",
      sortOrder: 0,
    },
    {
      question: "상품에 문제가 있으면 어떻게 하나요?",
      answer:
        "주문 상세페이지에서 '문의/분쟁 접수'로 해당 상품을 선택해 분쟁(하자/오배송/변질 등)으로 접수해 주세요.",
      sortOrder: 1,
    },
    {
      question: "구매 전 상품에 대해 질문할 수 있나요?",
      answer:
        "상품 상세페이지의 '판매자에게 문의하기'로 질문을 등록할 수 있고, 공개로 설정하면 다른 구매자도 답변을 볼 수 있습니다.",
      sortOrder: 2,
    },
  ];
  for (const f of faqSeeds) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!existing) {
      await prisma.faq.create({ data: f });
    }
  }

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
