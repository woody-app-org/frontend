import { useLayoutEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Send, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { GifStickerPickerDialog } from "./GifStickerPickerDialog";
import type { OutgoingMessageAttachment, StickerGifSearchItemDto } from "../types";

export type OutgoingDmAttachment = OutgoingMessageAttachment;

export interface DmComposerProps {
  conversationId: number;
  disabled?: boolean;
  onSend: (payload: {
    body?: string | null;
    attachmentUrls?: string[] | null;
    attachments?: OutgoingDmAttachment[] | null;
  }) => Promise<void>;
  /** Lista de mensagens faz scroll suave para o fim quando o composer expande no mobile. */
  onMobileComposerExpand?: () => void;
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
  thumbnailUrl?: string | null;
  provider?: string | null;
  externalId?: string | null;
  storageKey?: string;
  contentType?: string;
  sizeBytes?: number;
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

export function DmComposer({ conversationId, disabled, onSend, onMobileComposerExpand }: DmComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const stickerRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);
  const prevExpandedRef = useRef(false);

  const hasUploading = staged.some((s) => s.status === "uploading");
  const hasReady = staged.some((s) => s.status === "ready" && s.sendUrl);
  const canSend = Boolean(draft.trim() || hasReady) && !hasUploading;
  const blocked = disabled || busy || hasUploading;

  const isExpanded = Boolean(
    draft.trim() ||
      staged.length > 0 ||
      hasUploading ||
      textareaFocused ||
      stickerPickerOpen ||
      sendError != null
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const wasExpanded = prevExpandedRef.current;
    const becameExpanded = isExpanded && !wasExpanded;
    prevExpandedRef.current = isExpanded;
    if (!mq.matches || !becameExpanded) return;
    onMobileComposerExpand?.();
  }, [isExpanded, onMobileComposerExpand]);

  const uploadCtx = { scope: "message" as const, conversationId: String(conversationId) };

  const addFromCatalog = (item: StickerGifSearchItemDto) => {
    const id = `cat-${item.externalId}-${Date.now()}`;
    const mt = item.mediaType === "sticker" ? "sticker" : "gif";
    setStaged((prev) => {
      if (prev.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS) return prev;
      return [
        ...prev,
        {
          id,
          previewUrl: item.thumbnailUrl ?? item.url,
          sendUrl: item.url,
          mediaType: mt,
          status: "ready" as const,
          thumbnailUrl: item.thumbnailUrl,
          provider: item.provider,
          externalId: item.externalId,
        },
      ];
    });
  };

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
              storageKey: uploaded.storageKey,
              contentType: uploaded.contentType,
              sizeBytes: uploaded.sizeBytes,
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
            storageKey: uploaded.storageKey,
            contentType: uploaded.contentType,
            sizeBytes: uploaded.sizeBytes,
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
                storageKey: uploaded.storageKey,
                contentType: uploaded.contentType,
                sizeBytes: uploaded.sizeBytes,
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
                storageKey: uploaded.storageKey,
                contentType: uploaded.contentType,
                sizeBytes: uploaded.sizeBytes,
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
    setStickerPickerOpen(false);
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
              ...(s.thumbnailUrl ? { thumbnailUrl: s.thumbnailUrl } : {}),
              ...(s.provider ? { provider: s.provider } : {}),
              ...(s.externalId ? { externalId: s.externalId } : {}),
              ...(s.storageKey ? { storageKey: s.storageKey } : {}),
              ...(s.contentType ? { mimeType: s.contentType } : {}),
              ...(s.sizeBytes != null ? { fileSize: s.sizeBytes } : {}),
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
    <div
      className={cn(
        "shrink-0 border-t border-[var(--woody-divider)] bg-[var(--woody-header)]/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none",
        "transition-[padding] duration-200 ease-out",
        "md:p-3 md:pb-3",
        "max-md:px-3 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        isExpanded ? "max-md:pt-3" : "max-md:pt-2"
      )}
    >
      {sendError ? (
        <p className="mb-2 text-xs text-red-600 transition-opacity duration-200 ease-out">{sendError}</p>
      ) : null}

      <div
        className={cn(
          "flex flex-col transition-[gap] duration-200 ease-out",
          "gap-2 md:gap-2",
          isExpanded ? "max-md:gap-2" : "max-md:gap-1.5"
        )}
      >
        <MessageMediaPreview
          items={toPreviewItems(staged)}
          onRemove={removeStaged}
          disabled={busy || disabled}
        />

        <div
          className={cn(
            "flex flex-col md:flex-row md:items-end",
            "transition-[gap] duration-200 ease-out",
            "gap-2 md:gap-2",
            isExpanded ? "max-md:gap-2.5" : "max-md:gap-1.5"
          )}
        >
          <MessageMediaPicker
            fileInputRef={fileRef}
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(e) => void addFiles(e.target.files)}
            disabled={blocked}
            buttonDisabled={staged.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS}
            suppressToolbarFocusSteal
            aria-label="Anexar imagem ou vídeo"
            buttonClassName={cn(
              "transition-[width,height,min-height,min-width] duration-200 ease-out",
              !isExpanded ? "max-md:size-10" : "max-md:size-11"
            )}
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
          <div
            className={cn(
              "flex min-w-0 flex-1 max-md:items-end",
              "transition-[gap] duration-200 ease-out",
              "gap-2",
              isExpanded ? "max-md:gap-2.5" : "max-md:gap-1.5"
            )}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "shrink-0 border-[var(--woody-divider)] bg-[var(--woody-card)]",
                "size-11 md:size-11",
                "transition-[width,height,min-height,min-width] duration-200 ease-out",
                !isExpanded ? "max-md:size-10" : "max-md:size-11"
              )}
              disabled={blocked || staged.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setStickerPickerOpen(true)}
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
              onFocus={() => setTextareaFocused(true)}
              onBlur={() => setTextareaFocused(false)}
              placeholder="Mensagem…"
              maxLength={DM_MESSAGE_BODY_MAX_LENGTH}
              rows={2}
              disabled={blocked}
              className={cn(
                "flex-1 resize-none touch-manipulation min-h-[44px] md:min-h-0",
                "transition-[min-height,max-height,padding,border-radius] duration-200 ease-out",
                isExpanded
                  ? "max-md:min-h-[5rem] max-md:max-h-32 max-md:rounded-2xl max-md:border max-md:border-[var(--woody-divider)] max-md:bg-[var(--woody-card)] max-md:px-3.5 max-md:py-2.5"
                  : "max-md:min-h-[2.5rem] max-md:max-h-[2.75rem] max-md:rounded-full max-md:border max-md:border-[var(--woody-divider)] max-md:bg-[var(--woody-card)] max-md:px-4 max-md:py-2 max-md:leading-snug"
              )}
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
              className={cn(
                "shrink-0 border-[var(--woody-divider)] md:hidden",
                "transition-[opacity,box-shadow,width,height] duration-200 ease-out",
                isExpanded && canSend
                  ? "border-transparent bg-[var(--woody-nav)] text-white opacity-100 shadow-sm ring-2 ring-[var(--woody-nav)]/35 hover:bg-[var(--woody-nav)]/90 hover:text-white"
                  : "bg-[var(--woody-nav)] text-white opacity-45 hover:bg-[var(--woody-nav)]/90 hover:text-white hover:opacity-80",
                !isExpanded ? "size-10" : "size-11"
              )}
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
      </div>
      <p
        className={cn(
          "mt-1.5 text-[0.65rem] leading-snug text-[var(--woody-muted)] md:block",
          "transition-opacity duration-200 ease-out",
          isExpanded ? "max-md:opacity-100" : "max-md:opacity-60"
        )}
      >
        <span className="hidden md:inline">
          Enter envia · Shift+Enter nova linha · até {DM_MESSAGE_MAX_IMAGE_ATTACHMENTS} anexos · vídeo até{" "}
          {DM_MESSAGE_VIDEO_MAX_DURATION_SEC}s / {formatFileSize(DM_MESSAGE_VIDEO_MAX_BYTES)}
        </span>
        <span className="md:hidden">
          Até {DM_MESSAGE_MAX_IMAGE_ATTACHMENTS} anexos · vídeo máx. {DM_MESSAGE_VIDEO_MAX_DURATION_SEC}s
        </span>
      </p>

      <GifStickerPickerDialog
        open={stickerPickerOpen}
        onOpenChange={setStickerPickerOpen}
        onPick={(item) => addFromCatalog(item)}
        onRequestLocalFile={() => stickerRef.current?.click()}
        disabled={busy || disabled}
      />
    </div>
  );
}
