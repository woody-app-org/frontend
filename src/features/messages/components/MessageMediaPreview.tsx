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
      className={cn("mb-2 flex list-none flex-wrap gap-2 p-0", className)}
      role="list"
      aria-label="Anexos antes de enviar"
    >
      {items.map((s) => (
        <li key={s.id} className="relative">
          <div
            className={cn(
              "size-16 overflow-hidden rounded-lg ring-1 ring-[var(--woody-divider)]",
              s.status === "error" && "ring-amber-500/50"
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
                className="absolute inset-0 flex items-center justify-center bg-black/45 text-white"
                aria-hidden
              >
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : null}
          </div>
          {s.status === "error" && s.errorMessage ? (
            <p className="absolute left-0 top-full z-[1] mt-0.5 max-w-[10rem] text-[0.6rem] leading-tight text-amber-700 dark:text-amber-200">
              {s.errorMessage}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(s.id)}
            disabled={disabled || s.status === "uploading"}
            className={cn(
              woodyFocus.ring,
              "absolute -right-1 -top-1 inline-flex size-6 items-center justify-center rounded-full bg-[var(--woody-card)] text-[var(--woody-text)] shadow ring-1 ring-[var(--woody-divider)]",
              (disabled || s.status === "uploading") && "cursor-not-allowed opacity-50"
            )}
            aria-label="Remover anexo"
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
