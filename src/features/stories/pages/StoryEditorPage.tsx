import { useCallback, useId, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ImageIcon, Loader2, Music, Palette, Trash2, Type, Video, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { uploadImageMedia, uploadVideoMedia } from "@/lib/mediaUpload";
import { readVideoDurationSeconds } from "@/lib/readVideoDurationSeconds";
import { extractVideoPosterJpegBlob } from "@/lib/extractVideoPosterJpeg";
import { showSuccessToast } from "@/lib/toast/woodyToast";
import { SharedPostPreviewCard } from "@/features/messages/components/SharedPostPreviewCard";
import type { SharedPostPreviewDto } from "@/features/messages/types";
import { type DeezerTrack } from "../services/deezer.service";
import { MusicPickerSheet } from "../components/MusicPickerSheet";
import { StoryLayerItem } from "../components/StoryLayerItem";
import { useLayerDrag } from "../hooks/useLayerDrag";
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
import {
  createStory,
  sharePostToStory,
  StoryLimitReachedError,
} from "../services/stories.service";
import type { StoryLayer } from "../types";

const MAX_LAYERS = 8;

interface SharedPostState {
  postId: string;
  preview: SharedPostPreviewDto;
}

function newTextLayer(): StoryLayer {
  return {
    id: crypto.randomUUID(),
    type: "text",
    x: 0.5,
    y: 0.5,
    width: 0.6,
    height: 0.12,
    rotation: 0,
    text: "",
    color: "#ffffff",
    fontSize: "md",
  };
}

export function StoryEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sharedPost = (location.state as { sharedPost?: SharedPostState } | null)?.sharedPost ?? null;

  const imageInputId = useId();
  const videoInputId = useId();
  const layerImageInputId = useId();
  const layerVideoInputId = useId();

  const canvasRef = useRef<HTMLDivElement>(null);

  const [layers, setLayers] = useState<StoryLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundKind, setBackgroundKind] = useState<"color" | "image" | "video">("color");
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
  const [contentScale, setContentScale] = useState(1);

  const [selectedTrack, setSelectedTrack] = useState<DeezerTrack | null>(null);
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [backgroundVideoMuted, setBackgroundVideoMuted] = useState(true);
  const [unmutedLayerIds, setUnmutedLayerIds] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;

  const updateLayer = useCallback((id: string, patch: Partial<StoryLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedLayerId((cur) => (cur === id ? null : cur));
  }, []);

  const addTextLayer = useCallback(() => {
    if (layers.length >= MAX_LAYERS) {
      setError(`Não é possível adicionar mais de ${MAX_LAYERS} elementos.`);
      return;
    }
    const layer = newTextLayer();
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
  }, [layers.length]);

  const onLayerImagePick = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (layers.length >= MAX_LAYERS) {
        setError(`Não é possível adicionar mais de ${MAX_LAYERS} elementos.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Escolhe um ficheiro de imagem (JPEG, PNG ou WebP).");
        return;
      }
      if (file.size > STORY_IMAGE_MAX_BYTES) {
        setError(`Imagem demasiado grande (máx. ${formatFileSize(STORY_IMAGE_MAX_BYTES)}).`);
        return;
      }
      setError(null);
      void (async () => {
        try {
          const uploaded = await uploadImageMedia(file, STORY_MEDIA_UPLOAD_CONTEXT);
          const layer: StoryLayer = {
            id: crypto.randomUUID(),
            type: "image",
            x: 0.5,
            y: 0.5,
            width: 1,
            height: 1,
            rotation: 0,
            mediaUrl: uploaded.url,
          };
          setLayers((prev) => [...prev, layer]);
          setSelectedLayerId(layer.id);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Não foi possível adicionar a foto.");
        }
      })();
    },
    [layers.length]
  );

  const onLayerVideoPick = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (layers.length >= MAX_LAYERS) {
        setError(`Não é possível adicionar mais de ${MAX_LAYERS} elementos.`);
        return;
      }
      if (!STORY_VIDEO_MIME_OK.has(file.type)) {
        setError("Vídeo: escolhe MP4, WebM ou MOV.");
        return;
      }
      if (file.size > STORY_VIDEO_MAX_BYTES) {
        setError(`Vídeo demasiado grande (máx. ${formatFileSize(STORY_VIDEO_MAX_BYTES)}).`);
        return;
      }
      setError(null);
      void (async () => {
        try {
          const blobUrl = URL.createObjectURL(file);
          const dur = await readVideoDurationSeconds(blobUrl);
          URL.revokeObjectURL(blobUrl);
          if (dur != null && dur > STORY_VIDEO_MAX_DURATION_SEC) {
            setError(
              `Vídeo demasiado longo (máx. ${STORY_VIDEO_MAX_DURATION_SEC} s). O teu ficheiro tem ~${Math.round(dur)} s.`
            );
            return;
          }
          const uploaded = await uploadVideoMedia(file, STORY_MEDIA_UPLOAD_CONTEXT, {
            durationSeconds: dur ?? undefined,
          });
          const layer: StoryLayer = {
            id: crypto.randomUUID(),
            type: "video",
            x: 0.5,
            y: 0.5,
            width: 1,
            height: 1,
            rotation: 0,
            mediaUrl: uploaded.url,
          };
          setLayers((prev) => [...prev, layer]);
          setSelectedLayerId(layer.id);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Não foi possível adicionar o vídeo.");
        }
      })();
    },
    [layers.length]
  );

  const onBackgroundImagePick = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
    setBackgroundKind("image");
    setBackgroundFile(file);
    if (backgroundPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(backgroundPreviewUrl);
    setBackgroundPreviewUrl(URL.createObjectURL(file));
  }, [backgroundPreviewUrl]);

  const onBackgroundVideoPick = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
      if (dur != null && dur > STORY_VIDEO_MAX_DURATION_SEC) {
        URL.revokeObjectURL(blobUrl);
        setError(
          `Vídeo demasiado longo (máx. ${STORY_VIDEO_MAX_DURATION_SEC} s). O teu ficheiro tem ~${Math.round(dur)} s.`
        );
        return;
      }
      setError(null);
      setBackgroundKind("video");
      setBackgroundFile(file);
      if (backgroundPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(backgroundPreviewUrl);
      setBackgroundPreviewUrl(blobUrl);
    })();
  }, [backgroundPreviewUrl]);

  const canPublish =
    !publishing &&
    (sharedPost != null ||
      backgroundKind === "color" ||
      backgroundFile != null ||
      layers.some((l) => (l.type === "text" && l.text?.trim()) || l.type !== "text"));

  const handlePublish = useCallback(async () => {
    if (!canPublish) return;
    setPublishing(true);
    setError(null);
    try {
      const musicPayload = selectedTrack
        ? {
            trackId: selectedTrack.id,
            title: selectedTrack.title,
            artist: selectedTrack.artist,
            previewUrl: selectedTrack.previewUrl,
            coverUrl: selectedTrack.coverUrl,
            startTime: selectedTrack.startTime,
          }
        : undefined;

      const layersPayload = layers.filter((l) => l.type !== "text" || (l.text && l.text.trim()));

      let story;
      if (sharedPost) {
        story = await sharePostToStory(
          sharedPost.postId,
          musicPayload,
          undefined,
          contentScale !== 1 ? contentScale : undefined,
          layersPayload,
          backgroundColor
        );
      } else if (backgroundKind === "image" && backgroundFile) {
        const uploaded = await uploadImageMedia(backgroundFile, STORY_MEDIA_UPLOAD_CONTEXT);
        story = await createStory({
          mediaType: "image",
          mediaUrl: uploaded.url,
          storageKey: uploaded.storageKey,
          music: musicPayload,
          layers: layersPayload,
        });
      } else if (backgroundKind === "video" && backgroundFile) {
        let durationSeconds: number | undefined;
        if (backgroundPreviewUrl) {
          const dur = await readVideoDurationSeconds(backgroundPreviewUrl);
          if (dur != null && dur > 0) durationSeconds = dur;
        }
        let thumbnailUrl: string | undefined;
        try {
          const posterBlob = await extractVideoPosterJpegBlob(backgroundFile);
          if (posterBlob) {
            const posterFile = new File([posterBlob], "story-poster.jpg", { type: "image/jpeg" });
            const thumbUp = await uploadImageMedia(posterFile, STORY_MEDIA_UPLOAD_CONTEXT);
            thumbnailUrl = thumbUp.url;
          }
        } catch {
          /* sem miniatura */
        }
        const uploaded = await uploadVideoMedia(backgroundFile, STORY_MEDIA_UPLOAD_CONTEXT, { durationSeconds });
        story = await createStory({
          mediaType: "video",
          mediaUrl: uploaded.url,
          storageKey: uploaded.storageKey,
          thumbnailUrl,
          music: musicPayload,
          layers: layersPayload,
        });
      } else {
        const textLayer = layersPayload.find((l) => l.type === "text");
        story = await createStory({
          mediaType: "text",
          text: textLayer?.text?.trim() || "",
          backgroundColor,
          music: musicPayload,
          layers: layersPayload,
        });
      }

      showSuccessToast("Story publicado.");
      dispatchStoriesChanged();
      navigate(-1);
      void story;
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
    sharedPost,
    backgroundKind,
    backgroundFile,
    backgroundPreviewUrl,
    backgroundColor,
    layers,
    selectedTrack,
    contentScale,
    navigate,
  ]);

  return (
    <div className="flex h-[100dvh] w-screen flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={cn("flex size-9 items-center justify-center rounded-full hover:bg-white/10", woodyFocus.ring)}
          aria-label="Cancelar"
        >
          <X className="size-5" aria-hidden />
        </button>
        <Button
          type="button"
          className="rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
          disabled={!canPublish}
          onClick={() => void handlePublish()}
        >
          {publishing ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              A publicar…
            </>
          ) : (
            "Publicar"
          )}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-2">
        <div
          ref={canvasRef}
          onPointerDown={() => setSelectedLayerId(null)}
          className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full overflow-hidden rounded-2xl"
          style={{ backgroundColor: backgroundKind === "color" ? backgroundColor : "#000000" }}
        >
          {sharedPost ? (
            <SharedPostLayer canvasRef={canvasRef} preview={sharedPost.preview} contentScale={contentScale} />
          ) : backgroundKind === "image" && backgroundPreviewUrl ? (
            <img src={backgroundPreviewUrl} alt="" className="size-full object-cover" />
          ) : backgroundKind === "video" && backgroundPreviewUrl ? (
            <>
              <video
                src={backgroundPreviewUrl}
                className="size-full object-cover"
                muted={backgroundVideoMuted}
                loop
                autoPlay
                playsInline
              />
              <button
                type="button"
                onClick={() => setBackgroundVideoMuted((prev) => !prev)}
                className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white"
                aria-label={backgroundVideoMuted ? "Ativar som do vídeo" : "Silenciar vídeo"}
              >
                {backgroundVideoMuted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
              </button>
            </>
          ) : null}

          {layers.map((layer) => (
            <StoryLayerItem
              key={layer.id}
              layer={layer}
              canvasRef={canvasRef}
              selected={selectedLayerId === layer.id}
              muted={!unmutedLayerIds.has(layer.id)}
              onSelect={() => setSelectedLayerId(layer.id)}
              onChange={(geo) => updateLayer(layer.id, geo)}
            />
          ))}

          {selectedLayer ? (
            <div className="absolute inset-x-0 top-2 z-30 flex justify-center gap-2">
              {selectedLayer.type === "video" ? (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() =>
                    setUnmutedLayerIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedLayer.id)) next.delete(selectedLayer.id);
                      else next.add(selectedLayer.id);
                      return next;
                    })
                  }
                  className="flex size-9 items-center justify-center rounded-full bg-black/70 text-white"
                  aria-label={unmutedLayerIds.has(selectedLayer.id) ? "Silenciar vídeo" : "Ativar som do vídeo"}
                >
                  {unmutedLayerIds.has(selectedLayer.id) ? (
                    <Volume2 className="size-4" aria-hidden />
                  ) : (
                    <VolumeX className="size-4" aria-hidden />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => removeLayer(selectedLayer.id)}
                className="flex size-9 items-center justify-center rounded-full bg-black/70 text-white"
                aria-label="Remover elemento"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {selectedLayer?.type === "text" ? (
        <div className="space-y-2 border-t border-white/10 px-4 py-3">
          <textarea
            value={selectedLayer.text ?? ""}
            onChange={(e) =>
              updateLayer(selectedLayer.id, { text: e.target.value.slice(0, STORY_TEXT_MAX_LENGTH) })
            }
            rows={2}
            maxLength={STORY_TEXT_MAX_LENGTH}
            placeholder="Escreve algo…"
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/50"
          />
          <div className="flex items-center gap-2">
            {["#ffffff", "#000000"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { color: c })}
                className={cn(
                  "size-7 rounded-full border-2",
                  selectedLayer.color === c ? "border-[var(--woody-nav)]" : "border-white/30"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateLayer(selectedLayer.id, { fontSize: size })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-semibold uppercase",
                  selectedLayer.fontSize === size
                    ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/20"
                    : "border-white/20"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sharedPost ? (
        <div className="px-4 pb-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
            Tamanho ({Math.round(contentScale * 100)}%)
          </label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={contentScale}
            onChange={(e) => setContentScale(Number(e.target.value))}
            className="w-full"
          />
        </div>
      ) : null}

      {error ? <p className="px-4 pb-2 text-sm text-amber-300">{error}</p> : null}

      <div className="flex items-center justify-around gap-1 border-t border-white/10 px-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <ToolButton icon={Type} label="Texto" onClick={addTextLayer} />

        <input id={layerImageInputId} type="file" accept={STORY_IMAGE_ACCEPT} className="sr-only" onChange={onLayerImagePick} />
        <ToolButton icon={ImageIcon} label="Foto" onClick={() => document.getElementById(layerImageInputId)?.click()} />

        <input id={layerVideoInputId} type="file" accept={STORY_VIDEO_ACCEPT} className="sr-only" onChange={onLayerVideoPick} />
        <ToolButton icon={Video} label="Vídeo" onClick={() => document.getElementById(layerVideoInputId)?.click()} />

        <ToolButton icon={Music} label="Música" onClick={() => setMusicPickerOpen(true)} active={!!selectedTrack} />

        <ToolButton
          icon={Palette}
          label="Cor"
          onClick={() => {
            setBackgroundKind("color");
            document.getElementById(`${imageInputId}-color`)?.click();
          }}
        />
        <input
          id={`${imageInputId}-color`}
          type="color"
          value={backgroundColor}
          onChange={(e) => {
            setBackgroundColor(e.target.value);
            setBackgroundKind("color");
          }}
          className="sr-only"
        />

        {!sharedPost ? (
          <>
            <input id={imageInputId} type="file" accept={STORY_IMAGE_ACCEPT} className="sr-only" onChange={onBackgroundImagePick} />
            <ToolButton icon={ImageIcon} label="Fundo" onClick={() => document.getElementById(imageInputId)?.click()} />
            <input id={videoInputId} type="file" accept={STORY_VIDEO_ACCEPT} className="sr-only" onChange={onBackgroundVideoPick} />
          </>
        ) : null}
      </div>

      <MusicPickerSheet open={musicPickerOpen} onOpenChange={setMusicPickerOpen} selected={selectedTrack} onSelect={setSelectedTrack} />
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Type;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs",
        active ? "text-[var(--woody-nav)]" : "text-white/80 hover:text-white",
        woodyFocus.ring
      )}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </button>
  );
}

/** Card do post compartilhado: arrastável no canvas e não-clicável durante a edição (fica clicável só no viewer). */
function SharedPostLayer({
  canvasRef,
  preview,
  contentScale,
}: {
  canvasRef: RefObject<HTMLDivElement | null>;
  preview: SharedPostPreviewDto;
  contentScale: number;
}) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const { onPointerDown, onPointerMove, onPointerUp } = useLayerDrag(
    canvasRef,
    { x: pos.x, y: pos.y, width: 1, height: 1 },
    (next) => setPos({ x: next.x, y: next.y })
  );

  return (
    <div
      onPointerDown={(e) => onPointerDown(e, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="absolute flex w-full max-w-sm -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-center gap-3 px-6"
      style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
    >
      <SharedPostPreviewCard
        preview={preview}
        className="w-full pointer-events-none"
        style={{ transform: `scale(${contentScale})` }}
      />
    </div>
  );
}
