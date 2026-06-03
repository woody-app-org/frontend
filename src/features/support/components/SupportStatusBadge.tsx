import { cn } from "@/lib/utils";
import { statusLabel, type SupportTicketStatus } from "../lib/supportHelpers";

interface SupportStatusBadgeProps {
  status: SupportTicketStatus | string;
  className?: string;
}

const config: Record<string, string> = {
  Open: "bg-amber-50 text-amber-800 ring-amber-200/80",
  InReview: "bg-blue-50 text-blue-700 ring-blue-200/80",
  WaitingUser: "bg-violet-50 text-violet-700 ring-violet-200/80",
  Closed: "bg-zinc-100 text-zinc-600 ring-zinc-200/80",
};

export function SupportStatusBadge({ status, className }: SupportStatusBadgeProps) {
  const classes = config[status] ?? config.Open;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        classes,
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
