import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { readImageAsDataUrlIfSmall } from "@/lib/readImageAsDataUrlIfSmall";
import { mediaTypeFromUpload, uploadImageMedia, uploadVideoMedia } from "@/lib/mediaUpload";
import { readVideoDurationSeconds } from "@/lib/readVideoDurationSeconds";
import { DM_MESSAGE_BODY_MAX_LENGTH, DM_MESSAGE_MAX_IMAGE_ATTACHMENTS } from "../lib/dmLimits";
import {
  DM_MESSAGE_IMAGE_MAX_BYTES,
  DM_MESSAGE_VIDEO_MAX_BYTES,
  DM_MESSAGE_VIDEO_MAX_DURATION_SEC,
  formatFileSize,
} from "../lib/dmMessageMediaLimits";
import { MessageMediaPicker } from "./MessageMediaPicker";
import { MessageMediaPreview, type MessageMediaPreviewItem } from "./MessageMediaPreview";

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

const VIDEO_MIME_OK = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type StagedRow = {
  id: string;
  previewUrl: string;
  sendUrl: string;
  mediaType: string;
  durationSeconds?: number;
  status: "uploading" | "ready" | "error";
  blobToRevoke?: string | null;
  errorMessage?: string;
};

function previewKind(mt: string): MessageMediaPreviewItem["kind"] {
  if (mt === "video") return "video";
  if (mt === "gif") return "gif";
  if (mt === "sticker") return "sticker";
  return "image";
}

function toPreviewItems(rows: StagedRow[]): MessageMediaPreviewItem[] {
  return rows.map((s) => ({
    id: s.id,
    previewUrl: s.previewUrl,
    kind: previewKind(s.mediaType),
    status: s.status,
    errorMessage: s.errorMessage,
  }));
}

export function DmComposer({ conversationId, disabled, onSend }: DmComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const stickerRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [extrasOpen, setExtrasOpen] = useState(false);

  const hasUploading = staged.some((s) => s.status === "uploading");
  const hasReady = staged.some((s) => s.status === "ready" && s.sendUrl);
  const canSend = Boolean(draft.trim() || hasReady) && !hasUploading;
  const blocked = disabled || busy || hasUploading;

  const uploadCtx = { scope: "message" as const, conversationId: String(conversationId) };

  const removeStaged = (id: string) => {
    setStaged((prev) => {
      const row = prev.find((x) => x.id === id);
      if (row?.blobToRevoke) URL.revokeObjectURL(row.blobToRevoke);
      return prev.filter((x) => x.id !== id);
    });
  };

  const failMessage = (e: unknown): string => {
    if (e instanceof Error && e.message.trim()) return e.message;
    return "Falha no envio do ficheiro.";
  };

  const processMediaFile = async (file: File) => {
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (file.type.startsWith("video/")) {
      if (!VIDEO_MIME_OK.has(file.type)) {
        setSendError("Vídeo: usa MP4, WebM ou MOV.");
        return;
      }
      if (file.size > DM_MESSAGE_VIDEO_MAX_BYTES) {
        setSendError(`Vídeo demasiado grande (máx. ${formatFileSize(DM_MESSAGE_VIDEO_MAX_BYTES)}).`);
        return;
      }
      const blobUrl = URL.createObjectURL(file);
      const dur = await readVideoDurationSeconds(blobUrl);
      if (dur != null && dur > DM_MESSAGE_VIDEO_MAX_DURATION_SEC) {
        URL.revokeObjectURL(blobUrl);
        setSendError(
          `Vídeo demasiado longo para mensagem (máx. ${DM_MESSAGE_VIDEO_MAX_DURATION_SEC} s). Este tem ~${dur} s.`
        );
        return;
      }

      let slotOk = false;
      setStaged((prev) => {
        if (prev.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) return prev;
        slotOk = true;
        return [
          ...prev,
          {
            id: key,
            previewUrl: blobUrl,
            sendUrl: "",
            mediaType: "video",
            status: "uploading",
            blobToRevoke: blobUrl,
          },
        ];
      });
      if (!slotOk) {
        URL.revokeObjectURL(blobUrl);
        return;
      }

      try {
        const uploaded = await uploadVideoMedia(file, uploadCtx, {
          ...(dur != null && dur > 0 ? { durationSeconds: dur } : {}),
        });
        const sec =
          uploaded.durationSeconds != null && Number.isFinite(uploaded.durationSeconds)
            ? uploaded.durationSeconds
            : dur;
        setStaged((prev) =>
          prev.map((s) => {
            if (s.id !== key) return s;
            if (s.blobToRevoke) URL.revokeObjectURL(s.blobToRevoke);
            return {
              id: key,
              previewUrl: uploaded.url,
              sendUrl: uploaded.url,
              mediaType: "video",
              status: "ready" as const,
              ...(sec != null && sec > 0 ? { durationSeconds: Math.round(sec) } : {}),
              blobToRevoke: null,
            };
          })
        );
      } catch (e) {
        setStaged((prev) =>
          prev.map((s) =>
            s.id === key
              ? {
                  ...s,
                  status: "error" as const,
                  errorMessage: failMessage(e),
                }
              : s
          )
        );
      }
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSendError("Escolhe uma imagem ou um vídeo.");
      return;
    }

    if (file.size > DM_MESSAGE_IMAGE_MAX_BYTES) {
      setSendError(`Imagem demasiado grande (máx. ${formatFileSize(DM_MESSAGE_IMAGE_MAX_BYTES)}).`);
      return;
    }

    if (file.size <= 450 * 1024 && file.type !== "image/gif") {
      try {
        const dataUrl = await readImageAsDataUrlIfSmall(file);
        setStaged((prev) => {
          if (prev.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) return prev;
          return [
            ...prev,
            {
              id: key,
              previewUrl: dataUrl,
              sendUrl: dataUrl,
              mediaType: "image",
              status: "ready" as const,
            },
          ];
        });
      } catch {
        setSendError("Não foi possível ler a imagem.");
      }
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    let slotOk = false;
    setStaged((prev) => {
      if (prev.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) return prev;
      slotOk = true;
      return [
        ...prev,
        {
          id: key,
          previewUrl: blobUrl,
          sendUrl: "",
          mediaType: "image",
          status: "uploading",
          blobToRevoke: blobUrl,
        },
      ];
    });
    if (!slotOk) {
      URL.revokeObjectURL(blobUrl);
      return;
    }

    try {
      const uploaded = await uploadImageMedia(file, uploadCtx);
      const mt = mediaTypeFromUpload(uploaded);
      const mediaType = mt === "gif" ? "gif" : "image";
      setStaged((prev) =>
        prev.map((s) => {
          if (s.id !== key) return s;
          if (s.blobToRevoke) URL.revokeObjectURL(s.blobToRevoke);
          return {
            id: key,
            previewUrl: uploaded.url,
            sendUrl: uploaded.url,
            mediaType,
            status: "ready" as const,
            blobToRevoke: null,
          };
        })
      );
    } catch (e) {
      setStaged((prev) =>
        prev.map((s) =>
          s.id === key
            ? {
                ...s,
                status: "error" as const,
                errorMessage: failMessage(e),
              }
            : s
        )
      );
    }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setSendError(null);
    for (const file of Array.from(files)) {
      await processMediaFile(file);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const addStickerOrGifFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setSendError(null);
    for (const file of Array.from(files)) {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
        const blobUrl = URL.createObjectURL(file);
        let slotOk = false;
        setStaged((prev) => {
          if (prev.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) return prev;
          slotOk = true;
          return [
            ...prev,
            {
              id: key,
              previewUrl: blobUrl,
              sendUrl: "",
              mediaType: "gif",
              status: "uploading",
              blobToRevoke: blobUrl,
            },
          ];
        });
        if (!slotOk) {
          URL.revokeObjectURL(blobUrl);
          continue;
        }
        try {
          const uploaded = await uploadImageMedia(file, uploadCtx);
          setStaged((prev) =>
            prev.map((s) => {
              if (s.id !== key) return s;
              if (s.blobToRevoke) URL.revokeObjectURL(s.blobToRevoke);
              return {
                id: key,
                previewUrl: uploaded.url,
                sendUrl: uploaded.url,
                mediaType: "gif",
                status: "ready" as const,
                blobToRevoke: null,
              };
            })
          );
        } catch (e) {
          setStaged((prev) =>
            prev.map((s) =>
              s.id === key
                ? { ...s, status: "error" as const, errorMessage: failMessage(e) }
                : s
            )
          );
        }
        continue;
      }

      if (file.type === "image/webp" || file.type === "image/png") {
        const blobUrl = URL.createObjectURL(file);
        let slotOk = false;
        setStaged((prev) => {
          if (prev.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) return prev;
          slotOk = true;
          return [
            ...prev,
            {
              id: key,
              previewUrl: blobUrl,
              sendUrl: "",
              mediaType: "sticker",
              status: "uploading",
              blobToRevoke: blobUrl,
            },
          ];
        });
        if (!slotOk) {
          URL.revokeObjectURL(blobUrl);
          continue;
        }
        try {
          const uploaded = await uploadImageMedia(file, uploadCtx);
          setStaged((prev) =>
            prev.map((s) => {
              if (s.id !== key) return s;
              if (s.blobToRevoke) URL.revokeObjectURL(s.blobToRevoke);
              return {
                id: key,
                previewUrl: uploaded.url,
                sendUrl: uploaded.url,
                mediaType: "sticker",
                status: "ready" as const,
                blobToRevoke: null,
              };
            })
          );
        } catch (e) {
          setStaged((prev) =>
            prev.map((s) =>
              s.id === key
                ? { ...s, status: "error" as const, errorMessage: failMessage(e) }
                : s
            )
          );
        }
      }
    }
    if (stickerRef.current) stickerRef.current.value = "";
    setExtrasOpen(false);
  };

  const submit = async () => {
    if (!canSend || blocked) return;
    const body = draft.trim() || null;
    const attachments =
      staged.filter((s) => s.status === "ready" && s.sendUrl).length > 0
        ? staged
            .filter((s) => s.status === "ready" && s.sendUrl)
            .map((s) => ({
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

      <MessageMediaPreview
        items={toPreviewItems(staged)}
        onRemove={removeStaged}
        disabled={busy || disabled}
      />

      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <MessageMediaPicker
          fileInputRef={fileRef}
          accept="image/*,video/mp4,video/webm,video/quicktime"
          multiple
          onChange={(e) => void addFiles(e.target.files)}
          disabled={blocked}
          buttonDisabled={staged.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS}
          aria-label="Anexar imagem ou vídeo"
        >
          <ImagePlus className="size-5 text-[var(--woody-nav)]" />
        </MessageMediaPicker>
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
              <Send className="size-5" />
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
      <p className="mt-1.5 text-[0.65rem] leading-snug text-[var(--woody-muted)] md:block">
        <span className="hidden md:inline">
          Enter envia · Shift+Enter nova linha · até {DM_MESSAGE_MAX_IMAGE_ATTACHMENTS} anexos · vídeo até{" "}
          {DM_MESSAGE_VIDEO_MAX_DURATION_SEC}s / {formatFileSize(DM_MESSAGE_VIDEO_MAX_BYTES)}
        </span>
        <span className="md:hidden">
          Até {DM_MESSAGE_MAX_IMAGE_ATTACHMENTS} anexos · vídeo máx. {DM_MESSAGE_VIDEO_MAX_DURATION_SEC}s
        </span>
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
