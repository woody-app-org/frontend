import { cn } from "@/lib/utils";
import type { ReportStatus } from "../services/adminReports.service";

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const config: Record<ReportStatus, { label: string; classes: string }> = {
  Pending: {
    label: "Pendente",
    classes: "bg-amber-50 text-amber-700 ring-amber-200/80",
  },
  InReview: {
    label: "Em análise",
    classes: "bg-blue-50 text-blue-700 ring-blue-200/80",
  },
  Resolved: {
    label: "Resolvida",
    classes: "bg-green-50 text-green-700 ring-green-200/80",
  },
  Rejected: {
    label: "Improcedente",
    classes: "bg-zinc-100 text-zinc-600 ring-zinc-200/80",
  },
};

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  const { label, classes } = config[status] ?? config.Pending;
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
