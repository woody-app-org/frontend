import { cn } from "@/lib/utils";

export interface CommunityTagProps {
  label: string;
  className?: string;
}

/** Chip compacto para tags de comunidade (alinhado aos pills do PostCard). */
export function CommunityTag({ label, className }: CommunityTagProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium",
        "bg-[var(--woody-nav)]/12 text-[var(--woody-text)] border border-[var(--woody-accent)]/15",
        className
      )}
    >
      {label}
    </span>
  );
}
