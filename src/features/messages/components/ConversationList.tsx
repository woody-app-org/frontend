import { cn } from "@/lib/utils";
import { woodySection } from "@/lib/woody-ui";
import type { ConversationResponseDto } from "../types";
import { ConversationListItem } from "./ConversationListItem";

export interface ConversationListProps {
  title: string;
  items: ConversationResponseDto[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading?: boolean;
  emptyLabel: string;
  className?: string;
}

export function ConversationList({
  title,
  items,
  selectedId,
  onSelect,
  loading,
  emptyLabel,
  className,
}: ConversationListProps) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h2 className={cn(woodySection.eyebrow, "px-1")}>{title}</h2>
      {loading ? (
        <p className="px-3 py-4 text-sm text-[var(--woody-muted)]">A carregar…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--woody-divider)] bg-[var(--woody-bg)]/60 px-3 py-6 text-center text-sm text-[var(--woody-muted)]">
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-col gap-1 p-0 m-0">
          {items.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              selected={selectedId === c.id}
              onSelect={() => onSelect(c.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
