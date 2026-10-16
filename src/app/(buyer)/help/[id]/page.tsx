import { notFound } from "next/navigation";
import { getSession } from "@/server/session";
import { getTicketDetail } from "@/server/support/queries";
import { TicketThread } from "@/components/support/TicketThread";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const ticket = await getTicketDetail(id);
  if (!ticket || !session || ticket.userId !== session.sub) notFound();

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <TicketThread ticket={ticket} backHref="/help" backLabel="문의 내역" />
    </section>
  );
}
