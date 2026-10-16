import { notFound } from "next/navigation";
import { getSession } from "@/server/session";
import { prisma } from "@/lib/db";
import { getTicketDetail } from "@/server/support/queries";
import { TicketThread } from "@/components/support/TicketThread";

export default async function SellerTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const seller = session
    ? await prisma.seller.findUnique({ where: { userId: session.sub } })
    : null;
  const ticket = await getTicketDetail(id);
  if (!ticket || !seller || ticket.sellerId !== seller.id) notFound();

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <TicketThread ticket={ticket} backHref="/seller/support" backLabel="문의 목록" />
    </section>
  );
}
