import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Send, Smile, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerShellRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [staged, setStaged] = useState<StagedRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);
  const prevExpandedRef = useRef(false);

  const attachmentSlotsFull = staged.length >= DM_MESSAGE_MAX_IMAGE_ATTACHMENTS;

  const scheduleAfterActionsMenuClose = useCallback((action: () => void) => {
    setActionsMenuOpen(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(action);
    });
  }, []);

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
      actionsMenuOpen ||
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const mq = window.matchMedia("(max-width: 767px)");
    let t: ReturnType<typeof setTimeout> | null = null;
    let lastHeight = vv.height;
    const onViewportChange = () => {
      if (!mq.matches) return;
      const dh = Math.abs(vv.height - lastHeight);
      lastHeight = vv.height;
      if (dh < 56) return;
      if (t != null) clearTimeout(t);
      t = setTimeout(() => {
        t = null;
        onMobileComposerExpand?.();
      }, 72);
    };
    vv.addEventListener("resize", onViewportChange);
    vv.addEventListener("scroll", onViewportChange);
    return () => {
      vv.removeEventListener("resize", onViewportChange);
      vv.removeEventListener("scroll", onViewportChange);
      if (t != null) clearTimeout(t);
    };
  }, [onMobileComposerExpand]);

  const scrollComposerIntoViewMobile = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    window.requestAnimationFrame(() => {
      composerShellRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, []);

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
      ref={composerShellRef}
      className={cn(
        "shrink-0 border-t border-[var(--woody-divider)] backdrop-blur-sm md:bg-transparent md:backdrop-blur-none",
        "transition-[padding,background-color] duration-[220ms] ease-out",
        "md:border-t md:border-[var(--woody-divider)] md:p-3 md:pb-3",
        "max-md:border-[var(--woody-divider)]/80 max-md:bg-[var(--woody-card)]/[0.93] max-md:shadow-[0_-8px_32px_rgba(15,15,15,0.045)] max-md:backdrop-blur-md",
        "max-md:ps-[max(0.75rem,env(safe-area-inset-left))] max-md:pe-[max(0.75rem,env(safe-area-inset-right))] max-md:pb-[max(0.625rem,env(safe-area-inset-bottom))]",
        isExpanded ? "max-md:pt-3.5" : "max-md:pt-2.5"
      )}
    >
      {sendError ? (
        <div
          role="alert"
          className={cn(
            "mb-2 rounded-xl border border-red-300/55 bg-red-500/[0.07] px-3 py-2 md:mb-2.5",
            "transition-opacity duration-200 ease-out dark:border-red-400/35 dark:bg-red-500/10"
          )}
        >
          <p className="text-xs font-medium leading-snug text-red-800 dark:text-red-100">{sendError}</p>
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col transition-[gap] duration-[220ms] ease-out md:gap-2",
          isExpanded ? "max-md:gap-2.5" : "max-md:gap-1.5"
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
            "transition-[gap] duration-[220ms] ease-out",
            "gap-2 md:gap-2",
            isExpanded ? "max-md:gap-2.5" : "max-md:gap-2"
          )}
        >
          <div className="hidden shrink-0 md:block">
            <MessageMediaPicker
              fileInputRef={fileRef}
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              onChange={(e) => void addFiles(e.target.files)}
              disabled={blocked}
              buttonDisabled={attachmentSlotsFull}
              suppressToolbarFocusSteal
              aria-label="Anexar imagem ou vídeo"
            >
              <ImagePlus className="size-5 text-[var(--woody-nav)]" />
            </MessageMediaPicker>
          </div>
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
              "flex min-w-0 flex-1",
              "transition-[gap] duration-[220ms] ease-out",
              "gap-2",
              isExpanded ? "max-md:items-end max-md:gap-2.5" : "max-md:items-center max-md:gap-2"
            )}
          >
            <div className="shrink-0 md:hidden">
              <Popover open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={blocked || attachmentSlotsFull}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label="Anexos e extras"
                    aria-haspopup="menu"
                    aria-expanded={actionsMenuOpen}
                    className={cn(
                      "rounded-full border-[var(--woody-divider)]/90 bg-[var(--woody-card)] shadow-sm",
                      "transition-[width,height,box-shadow] duration-[220ms] ease-out",
                      "hover:bg-[var(--woody-bg)] active:bg-[var(--woody-nav)]/[0.07]",
                      actionsMenuOpen && "border-[var(--woody-nav)]/35 ring-2 ring-[var(--woody-nav)]/25",
                      !isExpanded ? "size-10" : "size-11"
                    )}
                  >
                    <Plus className="size-[1.15rem] text-[var(--woody-nav)]" strokeWidth={2.5} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  sideOffset={12}
                  collisionPadding={16}
                  className={cn(
                    "z-[90] w-[min(calc(100vw-2rem),18rem)] max-w-[min(calc(100vw-2rem),18rem)] overflow-hidden border-[var(--woody-divider)] bg-[var(--woody-card)] p-1.5 shadow-xl ring-1 ring-black/[0.035]",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100",
                    "data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=open]:ease-out data-[state=closed]:ease-out"
                  )}
                >
                  <div role="menu" aria-label="Anexos e extras" className="flex flex-col gap-1 py-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      disabled={blocked || attachmentSlotsFull}
                      className={cn(
                        woodyFocus.ring,
                        "flex min-h-[3rem] w-full touch-manipulation items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--woody-text)]",
                        "transition-colors duration-150 ease-out hover:bg-[var(--woody-nav)]/[0.08] active:bg-[var(--woody-nav)]/13",
                        "disabled:pointer-events-none disabled:opacity-45"
                      )}
                      onClick={() =>
                        scheduleAfterActionsMenuClose(() => {
                          fileRef.current?.click();
                        })
                      }
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woody-nav)]/[0.11] ring-1 ring-[var(--woody-divider)]/40">
                        <ImagePlus className="size-[1.2rem] text-[var(--woody-nav)]" aria-hidden strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">
                        <span className="block tracking-tight">Foto ou vídeo</span>
                        <span className="mt-0.5 block text-[0.7rem] font-normal leading-snug text-[var(--woody-muted)]">
                          Galeria ou câmara
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={busy || disabled || attachmentSlotsFull}
                      className={cn(
                        woodyFocus.ring,
                        "flex min-h-[3rem] w-full touch-manipulation items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--woody-text)]",
                        "transition-colors duration-150 ease-out hover:bg-[var(--woody-nav)]/[0.08] active:bg-[var(--woody-nav)]/13",
                        "disabled:pointer-events-none disabled:opacity-45"
                      )}
                      onClick={() =>
                        scheduleAfterActionsMenuClose(() => {
                          setStickerPickerOpen(true);
                        })
                      }
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woody-nav)]/[0.11] ring-1 ring-[var(--woody-divider)]/40">
                        <SmilePlus className="size-[1.2rem] text-[var(--woody-nav)]" aria-hidden strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">
                        <span className="block tracking-tight">GIF e stickers</span>
                        <span className="mt-0.5 block text-[0.7rem] font-normal leading-snug text-[var(--woody-muted)]">
                          Catálogo ou ficheiro local
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={blocked}
                      className={cn(
                        woodyFocus.ring,
                        "flex min-h-[3rem] w-full touch-manipulation items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--woody-text)]",
                        "transition-colors duration-150 ease-out hover:bg-[var(--woody-nav)]/[0.08] active:bg-[var(--woody-nav)]/13",
                        "disabled:pointer-events-none disabled:opacity-45"
                      )}
                      onClick={() =>
                        scheduleAfterActionsMenuClose(() => {
                          textareaRef.current?.focus();
                          scrollComposerIntoViewMobile();
                        })
                      }
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woody-nav)]/[0.11] ring-1 ring-[var(--woody-divider)]/40">
                        <Smile className="size-[1.2rem] text-[var(--woody-nav)]" aria-hidden strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">
                        <span className="block tracking-tight">Emoji</span>
                        <span className="mt-0.5 block text-[0.7rem] font-normal leading-snug text-[var(--woody-muted)]">
                          Teclado do sistema
                        </span>
                      </span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "hidden shrink-0 border-[var(--woody-divider)] bg-[var(--woody-card)] md:inline-flex",
                "size-11"
              )}
              disabled={blocked || attachmentSlotsFull}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setStickerPickerOpen(true)}
              aria-label="GIF ou sticker"
            >
              <SmilePlus className="size-5 text-[var(--woody-nav)]" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (sendError) setSendError(null);
              }}
              onFocus={() => {
                setTextareaFocused(true);
                scrollComposerIntoViewMobile();
              }}
              onBlur={() => setTextareaFocused(false)}
              placeholder="Mensagem…"
              maxLength={DM_MESSAGE_BODY_MAX_LENGTH}
              rows={2}
              disabled={blocked}
              className={cn(
                "flex-1 resize-none touch-manipulation min-h-[44px] md:min-h-0",
                "transition-[min-height,max-height,padding,border-radius,box-shadow] duration-[220ms] ease-out",
                "max-md:text-base md:text-sm",
                isExpanded
                  ? "max-md:min-h-[5.25rem] max-md:max-h-32 max-md:rounded-[1.125rem] max-md:border max-md:border-[var(--woody-divider)]/90 max-md:bg-[var(--woody-card)] max-md:px-3.5 max-md:py-3 max-md:leading-relaxed max-md:shadow-sm max-md:placeholder:text-[var(--woody-muted)]/80"
                  : "max-md:min-h-[2.625rem] max-md:max-h-[2.875rem] max-md:rounded-full max-md:border max-md:border-[var(--woody-divider)]/85 max-md:bg-[var(--woody-card)] max-md:px-[1.05rem] max-md:py-2 max-md:leading-snug max-md:shadow-[inset_0_1px_2px_rgba(15,15,15,0.04)] max-md:placeholder:text-[var(--woody-muted)]/75"
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
                "shrink-0 rounded-full border-transparent md:hidden",
                "touch-manipulation transition-[opacity,box-shadow,width,height] duration-[220ms] ease-out",
                isExpanded && canSend
                  ? "bg-[var(--woody-nav)] text-white opacity-100 shadow-md shadow-[color-mix(in_srgb,var(--woody-nav)_28%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--woody-nav)_32%,transparent)] hover:bg-[var(--woody-nav)]/92 hover:text-white"
                  : "bg-[var(--woody-nav)]/88 text-white opacity-[0.38] hover:bg-[var(--woody-nav)] hover:opacity-55 active:opacity-70",
                !isExpanded ? "size-10 min-h-10 min-w-10" : "size-11 min-h-11 min-w-11"
              )}
              onClick={() => void submit()}
              disabled={!canSend || blocked}
              aria-label={busy ? "A enviar…" : "Enviar mensagem"}
            >
              {busy ? (
                <Loader2 className="size-[1.125rem] animate-spin" aria-hidden strokeWidth={2.25} />
              ) : (
                <Send className="size-[1.125rem]" aria-hidden strokeWidth={2.25} />
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
          "transition-opacity duration-[220ms] ease-out",
          "max-md:mt-2 max-md:text-[0.625rem] max-md:tracking-[0.02em]",
          isExpanded ? "max-md:opacity-90" : "max-md:opacity-42"
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
