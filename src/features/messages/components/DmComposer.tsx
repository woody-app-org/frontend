import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { readImageAsDataUrlIfSmall } from "@/lib/readImageAsDataUrlIfSmall";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { DM_MESSAGE_BODY_MAX_LENGTH, DM_MESSAGE_MAX_IMAGE_ATTACHMENTS } from "../lib/dmLimits";

export interface DmComposerProps {
  disabled?: boolean;
  onSend: (payload: { body?: string | null; attachmentUrls?: string[] | null }) => Promise<void>;
}

export function DmComposer({ disabled, onSend }: DmComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const canSend = Boolean(draft.trim() || urls.length > 0);
  const blocked = disabled || busy;

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: string[] = [...urls];
    for (const file of Array.from(files)) {
      if (next.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) break;
      if (!file.type.startsWith("image/")) continue;
      try {
        const dataUrl = await readImageAsDataUrlIfSmall(file);
        if (!next.includes(dataUrl)) next.push(dataUrl);
      } catch {
        /* ignorar ficheiro inválido */
      }
    }
    setUrls(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (!canSend || blocked) return;
    const body = draft.trim() || null;
    const attachmentUrls = urls.length > 0 ? urls : null;
    setBusy(true);
    setSendError(null);
    try {
      await onSend({ body, attachmentUrls });
      setDraft("");
      setUrls([]);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-[var(--woody-divider)] bg-[var(--woody-header)]/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:bg-transparent md:pb-3 md:backdrop-blur-none">
      {sendError ? <p className="mb-2 text-xs text-red-600">{sendError}</p> : null}

      {urls.length > 0 ? (
        <ul className="mb-2 flex list-none flex-wrap gap-2 p-0">
          {urls.map((u) => (
            <li key={u.slice(0, 48)} className="relative">
              <div className="size-16 overflow-hidden rounded-lg ring-1 ring-[var(--woody-divider)]">
                <img src={u} alt="" className="size-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setUrls((prev) => prev.filter((x) => x !== u))}
                className={cn(
                  woodyFocus.ring,
                  "absolute -top-1 -right-1 inline-flex size-6 items-center justify-center rounded-full bg-[var(--woody-card)] text-[var(--woody-text)] shadow ring-1 ring-[var(--woody-divider)]"
                )}
                aria-label="Remover imagem"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => void addFiles(e.target.files)}
        />
        <div className="flex min-w-0 flex-1 gap-2 max-md:items-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 border-[var(--woody-divider)] bg-[var(--woody-card)]"
            disabled={blocked || urls.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS}
            onClick={() => fileRef.current?.click()}
            aria-label="Anexar imagem"
          >
            <ImagePlus className="size-5 text-[var(--woody-nav)]" />
          </Button>
          <Textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (sendError) setSendError(null);
            }}
            placeholder="Mensagem…"
            maxLength={DM_MESSAGE_BODY_MAX_LENGTH}
            rows={2}
            disabled={blocked}
            className="min-h-[44px] max-md:max-h-32 flex-1 resize-none md:min-h-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend && !blocked) void submit();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 border-[var(--woody-divider)] bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 hover:text-white md:hidden"
            onClick={() => void submit()}
            disabled={!canSend || blocked}
            aria-label={busy ? "A enviar…" : "Enviar mensagem"}
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Send className="size-5" aria-hidden />
            )}
          </Button>
        </div>
        <Button
          type="button"
          className="hidden min-h-11 shrink-0 md:inline-flex md:w-auto"
          onClick={() => void submit()}
          disabled={!canSend || blocked}
        >
          {busy ? "A enviar…" : "Enviar"}
        </Button>
      </div>
      <p className="mt-1.5 hidden text-[0.65rem] text-[var(--woody-muted)] md:block">
        Enter envia · Shift+Enter nova linha · até {DM_MESSAGE_MAX_IMAGE_ATTACHMENTS} imagens
      </p>
    </div>
  );
}
