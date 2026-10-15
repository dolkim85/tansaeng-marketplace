import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ad = await prisma.ad.update({
    where: { id },
    data: { clicks: { increment: 1 } },
    include: { product: true },
  }).catch(() => null);

  const origin = new URL(_req.url).origin;
  if (!ad) {
    return NextResponse.redirect(new URL("/", origin));
  }
  return NextResponse.redirect(new URL(`/products/${ad.product.slug}`, origin));
}
