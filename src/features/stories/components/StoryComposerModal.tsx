import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { ImageIcon, Loader2, Type, Video, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/components/media/ImageCropDialog";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { uploadImageMedia, uploadVideoMedia } from "@/lib/mediaUpload";
import { readVideoDurationSeconds } from "@/lib/readVideoDurationSeconds";
import { extractVideoPosterJpegBlob } from "@/lib/extractVideoPosterJpeg";
import { showSuccessToast } from "@/lib/toast/woodyToast";
import {
  createStory,
  StoryLimitReachedError,
} from "../services/stories.service";
import { STORY_MEDIA_UPLOAD_CONTEXT } from "../lib/storyUploadContext";
import {
  formatFileSize,
  STORY_IMAGE_ACCEPT,
  STORY_IMAGE_MAX_BYTES,
  STORY_TEXT_MAX_LENGTH,
  STORY_VIDEO_ACCEPT,
  STORY_VIDEO_MAX_BYTES,
  STORY_VIDEO_MAX_DURATION_SEC,
  STORY_VIDEO_MIME_OK,
} from "../lib/storyMediaLimits";
import { dispatchStoriesChanged } from "../lib/storyEvents";
import type { Story } from "../types";

type ComposerKind = "image" | "video" | "text";

const TEXT_BACKGROUNDS: { id: string; label: string; value: string; previewClass?: string }[] = [
  { id: "woody", label: "Verde Woody", value: "#8BC34A" },
  { id: "dark", label: "Preto", value: "#141414" },
  { id: "light", label: "Claro", value: "#F4F4EF" },
  {
    id: "gradient",
    label: "Gradiente",
    value: "#2E5C3E",
    previewClass: "bg-gradient-to-br from-emerald-600 via-[var(--woody-nav)] to-teal-800",
  },
];

export interface StoryComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Após publicação com sucesso (perfil deve refetch / abrir viewer). */
  onPublished?: (story: Story) => void;
}

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function StoryComposerModal({ open, onOpenChange, onPublished }: StoryComposerModalProps) {
  const imageInputId = useId();
  const videoInputId = useId();

  const [kind, setKind] = useState<ComposerKind>("image");
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const pendingCropRevoke = useRef<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const [textContent, setTextContent] = useState("");
  const [textBackgroundId, setTextBackgroundId] = useState(TEXT_BACKGROUNDS[0].id);

  const resetComposer = useCallback(() => {
    setKind("image");
    setError(null);
    setPublishing(false);
    setImageFile(null);
    revokeIfBlob(imagePreviewUrl);
    setImagePreviewUrl(null);
    setCropOpen(false);
    revokeIfBlob(cropSrc);
    setCropSrc(null);
    revokeIfBlob(pendingCropRevoke.current);
    pendingCropRevoke.current = null;
    setVideoFile(null);
    revokeIfBlob(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setTextContent("");
    setTextBackgroundId(TEXT_BACKGROUNDS[0].id);
  }, [imagePreviewUrl, cropSrc, videoPreviewUrl]);

  useEffect(() => {
    if (!open) resetComposer();
  }, [open, resetComposer]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const selectedBg =
    TEXT_BACKGROUNDS.find((b) => b.id === textBackgroundId) ?? TEXT_BACKGROUNDS[0];
  const textOnLight = selectedBg.id === "light";

  const canPublish =
    !publishing &&
    ((kind === "image" && imageFile != null) ||
      (kind === "video" && videoFile != null) ||
      (kind === "text" && textContent.trim().length > 0));

  const openCropForFile = useCallback((file: File) => {
    revokeIfBlob(pendingCropRevoke.current);
    const url = URL.createObjectURL(file);
    pendingCropRevoke.current = url;
    setCropSrc(url);
    setCropOpen(true);
  }, []);

  const onImagePick = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Escolhe um ficheiro de imagem (JPEG, PNG ou WebP).");
        return;
      }
      if (file.size > STORY_IMAGE_MAX_BYTES) {
        setError(`Imagem demasiado grande (máx. ${formatFileSize(STORY_IMAGE_MAX_BYTES)}).`);
        return;
      }
      setError(null);
      openCropForFile(file);
    },
    [openCropForFile]
  );

  const onVideoPick = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!STORY_VIDEO_MIME_OK.has(file.type)) {
      setError("Vídeo: escolhe MP4, WebM ou MOV.");
      return;
    }
    if (file.size > STORY_VIDEO_MAX_BYTES) {
      setError(`Vídeo demasiado grande (máx. ${formatFileSize(STORY_VIDEO_MAX_BYTES)}).`);
      return;
    }
    void (async () => {
      const blobUrl = URL.createObjectURL(file);
      const dur = await readVideoDurationSeconds(blobUrl);
      URL.revokeObjectURL(blobUrl);
      if (dur != null && dur > STORY_VIDEO_MAX_DURATION_SEC) {
        setError(
          `Vídeo demasiado longo (máx. ${STORY_VIDEO_MAX_DURATION_SEC} s). O teu ficheiro tem ~${Math.round(dur)} s.`
        );
        return;
      }
      setError(null);
      revokeIfBlob(videoPreviewUrl);
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    })();
  }, [videoPreviewUrl]);

  const handlePublish = useCallback(async () => {
    if (!canPublish) return;
    setPublishing(true);
    setError(null);
    try {
      let story: Story;
      if (kind === "image" && imageFile) {
        const uploaded = await uploadImageMedia(imageFile, STORY_MEDIA_UPLOAD_CONTEXT);
        story = await createStory({
          mediaType: "image",
          mediaUrl: uploaded.url,
          storageKey: uploaded.storageKey,
        });
      } else if (kind === "video" && videoFile) {
        let durationSeconds: number | undefined;
        if (videoPreviewUrl) {
          const dur = await readVideoDurationSeconds(videoPreviewUrl);
          if (dur != null && dur > 0) durationSeconds = dur;
        }
        let thumbnailUrl: string | undefined;
        try {
          const posterBlob = await extractVideoPosterJpegBlob(videoFile);
          if (posterBlob) {
            const posterFile = new File([posterBlob], "story-poster.jpg", { type: "image/jpeg" });
            const thumbUp = await uploadImageMedia(posterFile, STORY_MEDIA_UPLOAD_CONTEXT);
            thumbnailUrl = thumbUp.url;
          }
        } catch {
          /* sem miniatura */
        }
        const uploaded = await uploadVideoMedia(videoFile, STORY_MEDIA_UPLOAD_CONTEXT, {
          durationSeconds,
        });
        story = await createStory({
          mediaType: "video",
          mediaUrl: uploaded.url,
          storageKey: uploaded.storageKey,
          thumbnailUrl,
        });
      } else {
        const bg = selectedBg.value;
        story = await createStory({
          mediaType: "text",
          text: textContent.trim(),
          backgroundColor: bg,
        });
      }
      showSuccessToast("Story publicado.");
      dispatchStoriesChanged();
      onPublished?.(story);
      handleClose();
    } catch (e) {
      if (e instanceof StoryLimitReachedError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Não foi possível publicar o story.");
      }
    } finally {
      setPublishing(false);
    }
  }, [
    canPublish,
    kind,
    imageFile,
    videoFile,
    videoPreviewUrl,
    textContent,
    selectedBg.value,
    onPublished,
    handleClose,
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          overlayClassName="bg-black/55 backdrop-blur-[2px]"
          className={cn(
            "flex max-h-[min(100dvh,52rem)] w-[calc(100vw-0.75rem)] max-w-lg flex-col gap-0 overflow-hidden p-0",
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-md",
            "rounded-2xl border border-black/10 bg-[var(--woody-card)] shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--woody-divider)] px-4 py-3">
            <DialogTitle className="text-base font-semibold text-[var(--woody-text)]">
              Novo story
            </DialogTitle>
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-[var(--woody-muted)] hover:bg-black/5",
                woodyFocus.ring
              )}
              aria-label="Fechar"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Cria um story de imagem, vídeo ou texto. Expira em 24 horas.
          </DialogDescription>

          <div className="flex gap-1 border-b border-[var(--woody-divider)] px-3 py-2">
            {(
              [
                { id: "image" as const, label: "Foto", icon: ImageIcon },
                { id: "video" as const, label: "Vídeo", icon: Video },
                { id: "text" as const, label: "Texto", icon: Type },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                disabled={publishing}
                onClick={() => {
                  setKind(id);
                  setError(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                  woodyFocus.ring,
                  kind === id
                    ? "bg-[var(--woody-nav)]/14 text-[var(--woody-text)]"
                    : "text-[var(--woody-muted)] hover:bg-black/[0.04]"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {kind === "image" ? (
              <div className="space-y-3">
                <div className="mx-auto flex aspect-[9/16] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl bg-black/90 ring-1 ring-black/10">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt=""
                      className="size-full object-contain"
                    />
                  ) : (
                    <p className="px-4 text-center text-sm text-white/60">
                      Escolhe uma foto para o story
                    </p>
                  )}
                </div>
                <input
                  id={imageInputId}
                  type="file"
                  accept={STORY_IMAGE_ACCEPT}
                  className="sr-only"
                  onChange={onImagePick}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  disabled={publishing}
                  onClick={() => document.getElementById(imageInputId)?.click()}
                >
                  {imageFile ? "Trocar foto" : "Selecionar foto"}
                </Button>
              </div>
            ) : null}

            {kind === "video" ? (
              <div className="space-y-3">
                <div className="mx-auto flex aspect-[9/16] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl bg-black ring-1 ring-black/10">
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      className="size-full object-contain"
                      controls
                      playsInline
                      muted
                    />
                  ) : (
                    <p className="px-4 text-center text-sm text-white/60">
                      Escolhe um vídeo curto
                    </p>
                  )}
                </div>
                <input
                  id={videoInputId}
                  type="file"
                  accept={STORY_VIDEO_ACCEPT}
                  className="sr-only"
                  onChange={onVideoPick}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  disabled={publishing}
                  onClick={() => document.getElementById(videoInputId)?.click()}
                >
                  {videoFile ? "Trocar vídeo" : "Selecionar vídeo"}
                </Button>
                <p className="text-center text-xs text-[var(--woody-muted)]">
                  MP4, WebM ou MOV · máx. {formatFileSize(STORY_VIDEO_MAX_BYTES)} ·{" "}
                  {STORY_VIDEO_MAX_DURATION_SEC}s
                </p>
              </div>
            ) : null}

            {kind === "text" ? (
              <div className="space-y-4">
                <div
                  className={cn(
                    "mx-auto flex aspect-[9/16] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-2xl p-4 ring-1 ring-black/10",
                    selectedBg.previewClass
                  )}
                  style={
                    selectedBg.previewClass
                      ? undefined
                      : { backgroundColor: selectedBg.value }
                  }
                >
                  <p
                    className={cn(
                      "max-h-full w-full whitespace-pre-wrap break-words text-center text-lg font-semibold leading-snug",
                      textOnLight ? "text-[var(--woody-text)]" : "text-white"
                    )}
                  >
                    {textContent.trim() || "O teu texto aparece aqui"}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="story-text-input"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]"
                  >
                    Texto
                  </label>
                  <textarea
                    id="story-text-input"
                    value={textContent}
                    onChange={(e) => {
                      setTextContent(e.target.value.slice(0, STORY_TEXT_MAX_LENGTH));
                      setError(null);
                    }}
                    rows={4}
                    maxLength={STORY_TEXT_MAX_LENGTH}
                    placeholder="Escreve algo…"
                    className={cn(
                      "w-full resize-none rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-main-surface)] px-3 py-2.5 text-sm text-[var(--woody-text)]",
                      "placeholder:text-[var(--woody-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35"
                    )}
                  />
                  <p className="mt-1 text-right text-xs text-[var(--woody-muted)]">
                    {textContent.length}/{STORY_TEXT_MAX_LENGTH}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
                    Fundo
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        disabled={publishing}
                        onClick={() => setTextBackgroundId(bg.id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          woodyFocus.ring,
                          textBackgroundId === bg.id
                            ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/12 text-[var(--woody-text)]"
                            : "border-[var(--woody-divider)] text-[var(--woody-muted)] hover:border-[var(--woody-nav)]/40"
                        )}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 border-t border-[var(--woody-divider)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={publishing}
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
              disabled={!canPublish}
              onClick={() => void handlePublish()}
            >
              {publishing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  A publicar…
                </>
              ) : (
                "Publicar story"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={cropOpen}
        onOpenChange={(next) => {
          if (!next) {
            revokeIfBlob(cropSrc);
            setCropSrc(null);
            revokeIfBlob(pendingCropRevoke.current);
            pendingCropRevoke.current = null;
          }
          setCropOpen(next);
        }}
        imageSrc={cropSrc}
        title="Enquadrar story"
        description="Ajusta a foto no formato vertical (9:16)."
        aspect={9 / 16}
        cropShape="rect"
        outputWidth={1080}
        outputHeight={1920}
        layout="square"
        onConfirm={async (file) => {
          revokeIfBlob(imagePreviewUrl);
          setImageFile(file);
          setImagePreviewUrl(URL.createObjectURL(file));
          setError(null);
          setCropOpen(false);
        }}
      />
    </>
  );
}
