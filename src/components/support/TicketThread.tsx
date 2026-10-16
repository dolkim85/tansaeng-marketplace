import Link from "next/link";
import { closeTicketAction } from "@/server/support/actions";
import {
  TICKET_CATEGORY_LABEL,
  TICKET_STATUS_LABEL,
  USER_ROLE_LABEL,
} from "@/lib/supportLabels";
import { ReplyForm } from "./ReplyForm";
import type { getTicketDetail } from "@/server/support/queries";

type Ticket = NonNullable<Awaited<ReturnType<typeof getTicketDetail>>>;

export function TicketThread({
  ticket,
  backHref,
  backLabel,
}: {
  ticket: Ticket;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div>
      <Link
        href={backHref}
        className="text-xs text-brand-green hover:underline"
      >
        ← {backLabel}
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-deepgreen">
          {ticket.subject}
        </h1>
        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
          {TICKET_STATUS_LABEL[ticket.status]}
        </span>
      </div>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        {TICKET_CATEGORY_LABEL[ticket.category]} · {ticket.user.name}
        {ticket.seller && ` · ${ticket.seller.storeName}`}
        {ticket.product && ` · ${ticket.product.title}`}
        {ticket.category === "PRODUCT_QUESTION" &&
          (ticket.isPublic ? " · 공개" : " · 비공개")}
      </p>

      <ul className="mt-4 space-y-2">
        {ticket.messages.map((m) => (
          <li
            key={m.id}
            className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-brand-deepgreen">
                {m.author.name}
              </span>
              <span className="text-xs text-brand-deepgreen/50">
                {USER_ROLE_LABEL[m.authorRole]} ·{" "}
                {m.createdAt.toLocaleString("ko-KR")}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm text-brand-deepgreen/80">
              {m.body}
            </p>
          </li>
        ))}
      </ul>

      {ticket.status === "CLOSED" ? (
        <p className="mt-4 text-sm text-brand-deepgreen/60">
          종료된 문의입니다.
        </p>
      ) : (
        <>
          <ReplyForm ticketId={ticket.id} />
          <form action={closeTicketAction.bind(null, ticket.id)} className="mt-2">
            <button
              type="submit"
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
            >
              문의 종료
            </button>
          </form>
        </>
      )}
    </div>
  );
}
