import { Link } from "react-router-dom";
import { ChevronRight, LifeBuoy } from "lucide-react";
import type { SupportTicketListItem } from "../services/support.service";
import { SupportStatusBadge } from "./SupportStatusBadge";
import { categoryLabel, formatSupportDate } from "../lib/supportHelpers";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";

interface SupportTicketListProps {
  items: SupportTicketListItem[];
  emptyMessage?: string;
}

export function SupportTicketList({
  items,
  emptyMessage = "Você ainda não abriu nenhuma solicitação.",
}: SupportTicketListProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          woodySurface.card,
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--woody-accent)]/12 px-6 py-14 text-center"
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]">
          <LifeBuoy className="size-6" aria-hidden />
        </span>
        <p className="text-sm text-[var(--woody-muted)] max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((ticket) => (
        <li key={ticket.publicId}>
          <Link
            to={`/support/${ticket.publicId}`}
            className={cn(
              woodySurface.card,
              "flex items-start gap-3 rounded-2xl border border-[var(--woody-accent)]/12 p-4 transition-colors hover:border-[var(--woody-nav)]/25 hover:bg-[var(--woody-nav)]/[0.03]"
            )}
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[var(--woody-text)] truncate">{ticket.title}</h3>
                <SupportStatusBadge status={ticket.status} />
              </div>
              <p className="text-xs text-[var(--woody-muted)]">
                {categoryLabel(ticket.category)} · {formatSupportDate(ticket.createdAt)}
              </p>
              {ticket.lastResponseAt ? (
                <p className="text-xs text-[var(--woody-muted)]">
                  Última resposta: {formatSupportDate(ticket.lastResponseAt)}
                </p>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1 shrink-0 text-sm font-medium text-[var(--woody-nav)]">
              Ver
              <ChevronRight className="size-4" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
