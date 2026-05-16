import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/features/auth/types";

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const config: Record<
  VerificationStatus,
  { label: string; classes: string }
> = {
  PendingDocument: {
    label: "Aguarda documento",
    classes: "bg-zinc-100 text-zinc-600 ring-zinc-200/80",
  },
  PendingReview: {
    label: "Em análise",
    classes: "bg-amber-50 text-amber-700 ring-amber-200/80",
  },
  Approved: {
    label: "Aprovada",
    classes: "bg-green-50 text-green-700 ring-green-200/80",
  },
  Rejected: {
    label: "Recusada",
    classes: "bg-red-50 text-red-600 ring-red-200/80",
  },
};

export function VerificationStatusBadge({
  status,
  className,
}: VerificationStatusBadgeProps) {
  const { label, classes } = config[status] ?? config.PendingDocument;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
