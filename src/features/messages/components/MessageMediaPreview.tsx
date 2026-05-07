import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export type MessageMediaPreviewStatus = "uploading" | "ready" | "error";

export interface MessageMediaPreviewItem {
  id: string;
  previewUrl: string;
  kind: "image" | "video" | "gif" | "sticker";
  status: MessageMediaPreviewStatus;
  errorMessage?: string;
}

export interface MessageMediaPreviewProps {
  items: MessageMediaPreviewItem[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MessageMediaPreview({ items, onRemove, disabled, className }: MessageMediaPreviewProps) {
  if (items.length === 0) return null;
  return (
    <ul
      className={cn(
        "mb-0 flex list-none gap-2.5 p-0 md:mb-2 md:flex-wrap",
        "max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:overscroll-x-contain max-md:pb-0.5",
        "max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden",
        className
      )}
      role="list"
      aria-label="Anexos antes de enviar"
    >
      {items.map((s) => (
        <li key={s.id} className="relative flex shrink-0 flex-col gap-1 max-md:snap-start">
          <div className="relative">
            <div
              className={cn(
                "size-[4.25rem] overflow-hidden rounded-xl bg-[var(--woody-bg)] shadow-sm ring-1 ring-[var(--woody-divider)]/90 md:size-16 md:rounded-lg",
                s.status === "error" && "ring-amber-500/45"
              )}
            >
              {s.kind === "video" ? (
                <video
                  src={s.previewUrl}
                  className="size-full object-cover"
                  muted
                  playsInline
                  preload="none"
                />
              ) : (
                <img src={s.previewUrl} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
              )}
              {s.status === "uploading" ? (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white backdrop-blur-[1px]"
                  aria-hidden
                >
                  <Loader2 className="size-[1.125rem] animate-spin opacity-95" strokeWidth={2.25} />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onRemove(s.id)}
              disabled={disabled || s.status === "uploading"}
              className={cn(
                woodyFocus.ring,
                "absolute -right-1 -top-1 inline-flex size-7 min-h-[28px] min-w-[28px] touch-manipulation items-center justify-center rounded-full bg-[var(--woody-card)] text-[var(--woody-text)] shadow-md ring-1 ring-[var(--woody-divider)]/80 transition-opacity duration-150 ease-out md:size-6",
                (disabled || s.status === "uploading") && "cursor-not-allowed opacity-50"
              )}
              aria-label="Remover anexo"
            >
              <X className="size-3.5 md:size-3.5" strokeWidth={2} />
            </button>
          </div>
          {s.status === "error" && s.errorMessage ? (
            <p className="max-w-[10.5rem] text-[0.65rem] leading-snug text-amber-800 dark:text-amber-100/95">
              {s.errorMessage}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
