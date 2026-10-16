import { notFound } from "next/navigation";
import { getSession } from "@/server/session";
import { getTicketDetail } from "@/server/support/queries";
import { TicketThread } from "@/components/support/TicketThread";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const ticket = await getTicketDetail(id);
  if (!ticket || !session || !ADMIN_ROLES.has(session.role)) notFound();

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <TicketThread ticket={ticket} backHref="/admin/support" backLabel="고객센터" />
    </section>
  );
}
