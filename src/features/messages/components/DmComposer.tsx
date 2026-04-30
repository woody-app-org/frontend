import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, SmilePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { readImageAsDataUrlIfSmall } from "@/lib/readImageAsDataUrlIfSmall";
import { mediaTypeFromUpload, uploadImageMedia, uploadVideoMedia } from "@/lib/mediaUpload";
import { readVideoDurationSeconds } from "@/lib/readVideoDurationSeconds";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { DM_MESSAGE_BODY_MAX_LENGTH, DM_MESSAGE_MAX_IMAGE_ATTACHMENTS } from "../lib/dmLimits";

export type OutgoingDmAttachment = { url: string; mediaType: string; durationSeconds?: number };

export interface DmComposerProps {
  conversationId: number;
  disabled?: boolean;
  onSend: (payload: {
    body?: string | null;
    attachmentUrls?: string[] | null;
    attachments?: OutgoingDmAttachment[] | null;
  }) => Promise<void>;
}

type Staged = {
  key: string;
  previewUrl: string;
  sendUrl: string;
  mediaType: string;
  durationSeconds?: number;
};

export function DmComposer({ conversationId, disabled, onSend }: DmComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const stickerRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [staged, setStaged] = useState<Staged[]>([]);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [extrasOpen, setExtrasOpen] = useState(false);

  const canSend = Boolean(draft.trim() || staged.length > 0);
  const blocked = disabled || busy;

  const uploadCtx = { scope: "message" as const, conversationId: String(conversationId) };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...staged];
    for (const file of Array.from(files)) {
      if (next.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) break;
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try {
        if (file.type.startsWith("video/")) {
          if (file.type !== "video/mp4" && file.type !== "video/webm") continue;
          const blobUrl = URL.createObjectURL(file);
          const dur = await readVideoDurationSeconds(blobUrl);
          URL.revokeObjectURL(blobUrl);
          const uploaded = await uploadVideoMedia(file, uploadCtx, {
            ...(dur != null && dur > 0 ? { durationSeconds: dur } : {}),
          });
          next.push({
            key,
            previewUrl: uploaded.url,
            sendUrl: uploaded.url,
            mediaType: "video",
            ...(dur != null && dur > 0 ? { durationSeconds: dur } : {}),
          });
        } else if (file.type.startsWith("image/")) {
          if (file.size <= 450 * 1024 && file.type !== "image/gif") {
            const dataUrl = await readImageAsDataUrlIfSmall(file);
            next.push({ key, previewUrl: dataUrl, sendUrl: dataUrl, mediaType: "image" });
          } else {
            const uploaded = await uploadImageMedia(file, uploadCtx);
            const mt = mediaTypeFromUpload(uploaded);
            next.push({
              key,
              previewUrl: uploaded.url,
              sendUrl: uploaded.url,
              mediaType: mt === "gif" ? "gif" : "image",
            });
          }
        }
      } catch {
        /* ignorar ficheiro inválido */
      }
    }
    setStaged(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addStickerOrGifFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...staged];
    for (const file of Array.from(files)) {
      if (next.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) break;
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try {
        if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
          const uploaded = await uploadImageMedia(file, uploadCtx);
          next.push({
            key,
            previewUrl: uploaded.url,
            sendUrl: uploaded.url,
            mediaType: "gif",
          });
        } else if (file.type === "image/webp" || file.type === "image/png") {
          const uploaded = await uploadImageMedia(file, uploadCtx);
          next.push({
            key,
            previewUrl: uploaded.url,
            sendUrl: uploaded.url,
            mediaType: "sticker",
          });
        }
      } catch {
        /* ignorar */
      }
    }
    setStaged(next);
    if (stickerRef.current) stickerRef.current.value = "";
    setExtrasOpen(false);
  };

  const submit = async () => {
    if (!canSend || blocked) return;
    const body = draft.trim() || null;
    const attachments =
      staged.length > 0
        ? staged.map((s) => ({
            url: s.sendUrl,
            mediaType: s.mediaType,
            ...(s.durationSeconds != null ? { durationSeconds: s.durationSeconds } : {}),
          }))
        : null;
    setBusy(true);
    setSendError(null);
    try {
      await onSend({ body, attachments, attachmentUrls: null });
      setDraft("");
      setStaged([]);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-[var(--woody-divider)] bg-[var(--woody-header)]/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:bg-transparent md:pb-3 md:backdrop-blur-none">
      {sendError ? <p className="mb-2 text-xs text-red-600">{sendError}</p> : null}

      {staged.length > 0 ? (
        <ul className="mb-2 flex list-none flex-wrap gap-2 p-0">
          {staged.map((s) => (
            <li key={s.key} className="relative">
              <div className="size-16 overflow-hidden rounded-lg ring-1 ring-[var(--woody-divider)]">
                {s.mediaType === "video" ? (
                  <video src={s.previewUrl} className="size-full object-cover" muted playsInline />
                ) : (
                  <img src={s.previewUrl} alt="" className="size-full object-cover" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setStaged((prev) => prev.filter((x) => x.key !== s.key))}
                className={cn(
                  woodyFocus.ring,
                  "absolute -top-1 -right-1 inline-flex size-6 items-center justify-center rounded-full bg-[var(--woody-card)] text-[var(--woody-text)] shadow ring-1 ring-[var(--woody-divider)]"
                )}
                aria-label="Remover anexo"
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
          accept="image/*,video/mp4,video/webm"
          multiple
          className="sr-only"
          onChange={(e) => void addFiles(e.target.files)}
        />
        <input
          ref={stickerRef}
          type="file"
          accept="image/gif,image/webp,image/png,.gif"
          multiple
          className="sr-only"
          onChange={(e) => void addStickerOrGifFiles(e.target.files)}
        />
        <div className="flex min-w-0 flex-1 gap-2 max-md:items-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 border-[var(--woody-divider)] bg-[var(--woody-card)]"
            disabled={blocked || staged.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS}
            onClick={() => fileRef.current?.click()}
            aria-label="Anexar imagem ou vídeo"
          >
            <ImagePlus className="size-5 text-[var(--woody-nav)]" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 border-[var(--woody-divider)] bg-[var(--woody-card)]"
            disabled={blocked || staged.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS}
            onClick={() => setExtrasOpen(true)}
            aria-label="GIF ou sticker"
          >
            <SmilePlus className="size-5 text-[var(--woody-nav)]" />
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
        Enter envia · Shift+Enter nova linha · até {DM_MESSAGE_MAX_IMAGE_ATTACHMENTS} anexos
      </p>

      <Dialog open={extrasOpen} onOpenChange={setExtrasOpen}>
        <DialogContent className="max-w-sm border-[var(--woody-divider)] bg-[var(--woody-card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--woody-text)]">GIF e stickers</DialogTitle>
            <DialogDescription className="text-[var(--woody-muted)]">
              Escolhe um GIF, WebP ou PNG local. Integração com provedores externos fica plugável no backend (
              <code className="text-xs">IExternalAnimatedMediaProvider</code>).
            </DialogDescription>
          </DialogHeader>
          <Button type="button" className="w-full" onClick={() => stickerRef.current?.click()}>
            Escolher ficheiro…
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
