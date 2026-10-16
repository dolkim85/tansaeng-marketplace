import "server-only";
import { prisma } from "@/lib/db";
import { bucketDailyCounts, safeRatePercent } from "@/lib/analytics";

const TREND_DAYS = 7;

export async function getAdminAnalyticsSummary() {
  const [
    totalBuyers,
    activeBuyers,
    totalSellers,
    approvedSellers,
    totalOrders,
    paidOrders,
    cancelledOrders,
    paidOrderAgg,
    groupBuyCounts,
    adAgg,
    recentUsers,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { role: "BUYER", orders: { some: {} } } }),
    prisma.seller.count(),
    prisma.seller.count({ where: { applications: { some: { status: "APPROVED" } } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalKrw: true } }),
    prisma.groupBuy.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.ad.aggregate({ _sum: { impressions: true, clicks: true } }),
    prisma.user.findMany({
      where: { createdAt: { gte: new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
    }),
  ]);

  const gmvKrw = paidOrderAgg._sum.totalKrw ?? 0;
  const closedGroupBuyCount = groupBuyCounts
    .filter((g) => g.status !== "SCHEDULED")
    .reduce((sum, g) => sum + g._count._all, 0);
  const succeededGroupBuyCount =
    groupBuyCounts.find((g) => g.status === "SUCCEEDED")?._count._all ?? 0;

  return {
    gmvKrw,
    totalOrders,
    paidOrders,
    cancelledOrders,
    cancelRatePercent: safeRatePercent(cancelledOrders, totalOrders),
    avgOrderKrw: paidOrders > 0 ? Math.round(gmvKrw / paidOrders) : 0,

    totalBuyers,
    activeBuyers,
    buyerConversionPercent: safeRatePercent(activeBuyers, totalBuyers),
    totalSellers,
    approvedSellers,
    sellerApprovalPercent: safeRatePercent(approvedSellers, totalSellers),

    groupBuySuccessPercent: safeRatePercent(succeededGroupBuyCount, closedGroupBuyCount),
    adImpressions: adAgg._sum.impressions ?? 0,
    adClicks: adAgg._sum.clicks ?? 0,
    adCtrPercent: safeRatePercent(adAgg._sum.clicks ?? 0, adAgg._sum.impressions ?? 0),

    signupTrend: bucketDailyCounts(recentUsers.map((u) => u.createdAt), TREND_DAYS),
    orderTrend: bucketDailyCounts(recentOrders.map((o) => o.createdAt), TREND_DAYS),
  };
}
