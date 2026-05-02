import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Loader2, UserRound, Users, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Community, Post, PostPublicationContext } from "@/domain/types";
import { fetchMyCommunitiesForComposer } from "@/features/communities/services/community.service";
import { postComposerFieldStyles } from "../lib/postComposerFieldStyles";
import {
  POST_COMPOSER_TAGS_MAX_COUNT,
  POST_COMPOSER_TITLE_MAX_LENGTH,
  createPost,
  normalizePostComposerTags,
  type CreatePostMediaAttachmentPayload,
} from "../services/post.service";
import { readImageAsDataUrlIfSmall } from "@/lib/readImageAsDataUrlIfSmall";
import { mediaTypeFromUpload, uploadImageMedia, uploadVideoMedia } from "@/lib/mediaUpload";
import { readVideoDurationSeconds } from "@/lib/readVideoDurationSeconds";
import {
  POST_COMPOSER_IMAGE_MAX_BYTES,
  POST_COMPOSER_IMAGES_MAX_COUNT,
  POST_COMPOSER_VIDEO_MAX_BYTES,
  POST_COMPOSER_VIDEO_MAX_DURATION_SEC,
  formatFileSize,
} from "@/domain/postMediaLimits";
import { MediaPicker } from "@/components/media/MediaPicker";
import { MediaPreviewGrid, type MediaPreviewItem } from "@/components/media/MediaPreviewGrid";

const selectClass = cn(
  postComposerFieldStyles.input,
  "w-full appearance-none bg-[var(--woody-bg)] pr-9 cursor-pointer"
);

const VIDEO_MIME_OK = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function targetOptionClass(selected: boolean) {
  return cn(
    "flex w-full cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--woody-nav)]/25",
    selected
      ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/10 text-[var(--woody-text)] shadow-sm"
      : "border-[var(--woody-accent)]/18 bg-[var(--woody-bg)] text-[var(--woody-text)] hover:border-[var(--woody-accent)]/35"
  );
}

/** Item de imagem no compositor (antes do upload). */
interface ComposerImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

/** Item de vídeo no compositor (antes do upload). */
interface ComposerVideoItem {
  file: File;
  previewUrl: string;
}

export interface PostComposerFormProps {
  viewerId: string;
  /** Publicação sempre nesta comunidade (ex.: página da comunidade). */
  forcedCommunity?: Community;
  /** Pré-selecionar comunidade no feed quando não está fixada. */
  initialCommunityId?: string;
  /** `none` evita mensagem de sucesso no cartão (ex.: redirecionamento para o feed). */
  composerFeedback?: "full" | "none";
  onPostCreated?: (post: Post) => void;
  className?: string;
}

export function PostComposerForm({
  viewerId,
  forcedCommunity,
  initialCommunityId,
  composerFeedback = "full",
  onPostCreated,
  className,
}: PostComposerFormProps) {
  const idBase = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [publishTarget, setPublishTarget] = useState<PostPublicationContext>(() => {
    if (forcedCommunity) return "community";
    if (initialCommunityId) return "community";
    return "profile";
  });

  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [communityId, setCommunityId] = useState(forcedCommunity?.id ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  // Listas de mídia (imagem e vídeo são mutuamente exclusivos)
  const [imageItems, setImageItems] = useState<ComposerImageItem[]>([]);
  const [videoItem, setVideoItem] = useState<ComposerVideoItem | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [communityLoadError, setCommunityLoadError] = useState(false);
  const [communityReloadKey, setCommunityReloadKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successKind, setSuccessKind] = useState<PostPublicationContext>("profile");

  const isCommunityFlow = !!forcedCommunity || publishTarget === "community";
  const canPickTarget = !forcedCommunity;

  // Limpar Object URLs ao desmontar
  useEffect(() => {
    return () => {
      imageItems.forEach((it) => URL.revokeObjectURL(it.previewUrl));
      if (videoItem) URL.revokeObjectURL(videoItem.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (composerFeedback === "full" && showSuccess) {
      const t = window.setTimeout(() => setShowSuccess(false), 3200);
      return () => window.clearTimeout(t);
    }
  }, [composerFeedback, showSuccess]);

  useEffect(() => {
    if (forcedCommunity) {
      setCommunityId(forcedCommunity.id);
      setPublishTarget("community");
      setLoadingCommunities(false);
      setCommunityLoadError(false);
      return;
    }

    if (publishTarget !== "community") {
      setLoadingCommunities(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingCommunities(true);
      setCommunityLoadError(false);
      try {
        const list = await fetchMyCommunitiesForComposer();
        if (cancelled) return;
        setMyCommunities(list);
        setCommunityId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          if (initialCommunityId && list.some((c) => c.id === initialCommunityId)) {
            return initialCommunityId;
          }
          return list[0]?.id ?? "";
        });
      } catch {
        if (!cancelled) setCommunityLoadError(true);
      } finally {
        if (!cancelled) setLoadingCommunities(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [forcedCommunity, initialCommunityId, communityReloadKey, publishTarget]);

  // --- Handlers de imagem ---

  const onImageFilesChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (!files.length) return;

      if (videoItem) {
        setFormError("Remove o vídeo antes de adicionar imagens.");
        return;
      }

      const remaining = POST_COMPOSER_IMAGES_MAX_COUNT - imageItems.length;
      if (remaining <= 0) {
        setFormError(`Máximo de ${POST_COMPOSER_IMAGES_MAX_COUNT} imagens por publicação.`);
        return;
      }

      // Validar tipo e tamanho
      for (const f of files) {
        if (!f.type.startsWith("image/")) {
          setFormError("Apenas imagens são aceites neste campo.");
          return;
        }
        if (f.size > POST_COMPOSER_IMAGE_MAX_BYTES) {
          setFormError(
            `"${f.name}" é demasiado grande (máx. ${formatFileSize(POST_COMPOSER_IMAGE_MAX_BYTES)}).`
          );
          return;
        }
      }

      const toAdd = files.slice(0, remaining);
      const skipped = files.length - toAdd.length;

      const newItems: ComposerImageItem[] = toAdd.map((f) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
      }));

      setImageItems((prev) => [...prev, ...newItems]);

      if (skipped > 0) {
        setFormError(
          `Só foram adicionadas ${toAdd.length} imagens — máximo de ${POST_COMPOSER_IMAGES_MAX_COUNT} por publicação.`
        );
      } else {
        setFormError(null);
      }
    },
    [imageItems.length, videoItem]
  );

  const removeImage = useCallback((id: string) => {
    setImageItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
    setFormError(null);
  }, []);

  // --- Handlers de vídeo ---

  const onVideoFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;

      if (imageItems.length > 0) {
        setFormError("Remove as imagens antes de adicionar um vídeo.");
        return;
      }

      if (!VIDEO_MIME_OK.has(f.type)) {
        setFormError("Vídeo: escolhe MP4, WebM ou MOV.");
        return;
      }
      if (f.size > POST_COMPOSER_VIDEO_MAX_BYTES) {
        setFormError(`Vídeo demasiado grande (máx. ${formatFileSize(POST_COMPOSER_VIDEO_MAX_BYTES)}).`);
        return;
      }

      void (async () => {
        const blobUrl = URL.createObjectURL(f);
        const dur = await readVideoDurationSeconds(blobUrl);
        URL.revokeObjectURL(blobUrl);
        if (dur != null && dur > POST_COMPOSER_VIDEO_MAX_DURATION_SEC) {
          setFormError(
            `Vídeo demasiado longo (máx. ${POST_COMPOSER_VIDEO_MAX_DURATION_SEC} s). O teu ficheiro tem ~${Math.round(dur)} s.`
          );
          return;
        }
        setFormError(null);
        setVideoItem({ file: f, previewUrl: URL.createObjectURL(f) });
      })();
    },
    [imageItems.length]
  );

  const removeVideo = useCallback(() => {
    setVideoItem((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setFormError(null);
  }, []);

  // --- Preview para MediaPreviewGrid ---

  const previewItems = useMemo((): MediaPreviewItem[] => {
    const imgs: MediaPreviewItem[] = imageItems.map((it) => ({
      id: it.id,
      previewUrl: it.previewUrl,
      kind: "image" as const,
    }));
    const vid: MediaPreviewItem[] = videoItem
      ? [{ id: "video", previewUrl: videoItem.previewUrl, kind: "video" as const }]
      : [];
    return [...imgs, ...vid];
  }, [imageItems, videoItem]);

  const removePreview = useCallback(
    (id: string) => {
      if (id === "video") removeVideo();
      else removeImage(id);
    },
    [removeImage, removeVideo]
  );

  // --- Submit ---

  const handleSubmit = async () => {
    setFormError(null);

    const context: PostPublicationContext = forcedCommunity ? "community" : publishTarget;

    if (context === "community") {
      const cid = forcedCommunity?.id ?? communityId;
      if (!cid) {
        setFormError("Escolhe uma comunidade.");
        return;
      }
    }

    if (!title.trim() || !content.trim()) {
      setFormError("Preencha o título e o conteúdo.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      let mediaAttachments: CreatePostMediaAttachmentPayload[] | undefined;

      const cid = forcedCommunity?.id ?? communityId;
      const uploadCtx =
        context === "community"
          ? ({ scope: "post" as const, publicationContext: "community" as const, communityId: cid } as const)
          : ({ scope: "post" as const, publicationContext: "profile" as const } as const);

      if (videoItem) {
        let durationSeconds: number | undefined;
        const dur = await readVideoDurationSeconds(videoItem.previewUrl);
        if (dur != null && dur > 0) durationSeconds = dur;

        const uploaded = await uploadVideoMedia(videoItem.file, uploadCtx, { durationSeconds });
        const sec =
          uploaded.durationSeconds != null && Number.isFinite(uploaded.durationSeconds)
            ? uploaded.durationSeconds
            : durationSeconds;
        mediaAttachments = [
          {
            url: uploaded.url,
            mediaType: "video",
            storageKey: uploaded.storageKey,
            mimeType: uploaded.contentType,
            fileSize: uploaded.sizeBytes,
            ...(sec != null && sec > 0 ? { durationSeconds: Math.round(sec) } : {}),
          },
        ];
      } else if (imageItems.length > 0) {
        // Upload de todas as imagens em paralelo para melhor performance
        const results = await Promise.all(
          imageItems.map(async (item) => {
            const f = item.file;
            if (f.size <= 450 * 1024 && f.type !== "image/gif") {
              const dataUrl = await readImageAsDataUrlIfSmall(f);
              return { url: dataUrl, mediaType: "image" as const };
            }
            const uploaded = await uploadImageMedia(f, uploadCtx);
            const mt = mediaTypeFromUpload(uploaded);
            return {
              url: uploaded.url,
              mediaType: (mt === "gif" ? "gif" : "image") as "image" | "gif",
              storageKey: uploaded.storageKey,
              mimeType: uploaded.contentType,
              fileSize: uploaded.sizeBytes,
            };
          })
        );
        mediaAttachments = results;
      }

      const tags = normalizePostComposerTags(tagsRaw);

      const post = await createPost(
        {
          publicationContext: context,
          communityId: context === "community" ? (forcedCommunity?.id ?? communityId) : undefined,
          title: title.trim(),
          content: content.trim(),
          tags: tags.length ? tags : undefined,
          imageUrl: imageUrl ?? null,
          mediaAttachments,
        },
        viewerId
      );

      // Limpar estado de mídia após sucesso
      setTitle("");
      setContent("");
      setTagsRaw("");
      setImageItems((prev) => {
        prev.forEach((it) => URL.revokeObjectURL(it.previewUrl));
        return [];
      });
      setVideoItem((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });

      if (composerFeedback === "full") {
        setSuccessKind(context);
        setShowSuccess(true);
      }
      onPostCreated?.(post);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Falha ao publicar.");
    } finally {
      setSubmitting(false);
    }
  };

  const noMemberships =
    isCommunityFlow && !forcedCommunity && !loadingCommunities && !communityLoadError && myCommunities.length === 0;

  const communityBlocking =
    isCommunityFlow &&
    !forcedCommunity &&
    (loadingCommunities || communityLoadError || noMemberships || !communityId);

  const fieldsDisabled = submitting || (isCommunityFlow && !forcedCommunity && loadingCommunities);

  const submitDisabled = submitting || communityBlocking || !title.trim() || !content.trim();

  const contentPlaceholder =
    publishTarget === "profile" && !forcedCommunity
      ? "Partilha algo no teu perfil…"
      : "Partilha algo com a comunidade…";

  const hasImages = imageItems.length > 0;
  const hasVideo = videoItem !== null;
  const imagesFull = imageItems.length >= POST_COMPOSER_IMAGES_MAX_COUNT;

  return (
    <div className={cn("space-y-3", className)} aria-busy={submitting}>
      {composerFeedback === "full" && showSuccess && (
        <p
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-950 dark:text-emerald-100"
          role="status"
          aria-live="polite"
        >
          {successKind === "profile"
            ? "Publicação criada no teu perfil."
            : "Publicação criada na comunidade."}
        </p>
      )}

      {canPickTarget && (
        <div className="space-y-2">
          <span id={`${idBase}-target-legend`} className="text-sm font-medium text-[var(--woody-text)]">
            Onde queres publicar?
          </span>
          <div
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            role="radiogroup"
            aria-labelledby={`${idBase}-target-legend`}
          >
            <label className={targetOptionClass(publishTarget === "profile")}>
              <input
                type="radio"
                className="sr-only"
                name={`${idBase}-publish-target`}
                checked={publishTarget === "profile"}
                onChange={() => {
                  setPublishTarget("profile");
                  setFormError(null);
                }}
                disabled={submitting}
              />
              <UserRound className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">No meu perfil</span>
                <span className="mt-0.5 block text-xs font-normal text-[var(--woody-muted)]">
                  Visível no teu perfil; não precisas de comunidade.
                </span>
              </span>
            </label>
            <label className={targetOptionClass(publishTarget === "community")}>
              <input
                type="radio"
                className="sr-only"
                name={`${idBase}-publish-target`}
                checked={publishTarget === "community"}
                onChange={() => {
                  setPublishTarget("community");
                  setFormError(null);
                }}
                disabled={submitting}
              />
              <Users className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">Numa comunidade</span>
                <span className="mt-0.5 block text-xs font-normal text-[var(--woody-muted)]">
                  Só comunidades em que participas e podes publicar.
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      {isCommunityFlow && !forcedCommunity && (
        <div className="space-y-1.5">
          <label htmlFor={`${idBase}-community`} className="text-sm font-medium text-[var(--woody-text)]">
            Comunidade
          </label>
          {loadingCommunities ? (
            <div className="flex h-11 items-center gap-2 rounded-xl border border-[var(--woody-accent)]/15 px-3 text-sm text-[var(--woody-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              A carregar…
            </div>
          ) : communityLoadError ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
              <p className="mb-2">Não foi possível carregar as suas comunidades.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg border-amber-600/30"
                onClick={() => setCommunityReloadKey((k) => k + 1)}
              >
                Tentar novamente
              </Button>
            </div>
          ) : noMemberships ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
              Precisas de participar numa comunidade para publicar aqui.{" "}
              <Link
                to="/communities"
                className="font-semibold text-[var(--woody-nav)] underline-offset-2 hover:underline"
              >
                Explorar comunidades
              </Link>
            </p>
          ) : (
            <div className="relative">
              <select
                id={`${idBase}-community`}
                className={selectClass}
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                disabled={fieldsDisabled}
                aria-required
              >
                {myCommunities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--woody-muted)] text-xs">
                ▼
              </span>
            </div>
          )}
        </div>
      )}

      {forcedCommunity && (
        <div className="rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5 px-3 py-2 text-sm">
          <span className="text-[var(--woody-muted)]">A publicar em </span>
          <span className="font-semibold text-[var(--woody-text)]">{forcedCommunity.name}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`${idBase}-title`} className="text-sm font-medium text-[var(--woody-text)]">
            Título
          </label>
          <span className="text-xs tabular-nums text-[var(--woody-muted)]">
            {title.length}/{POST_COMPOSER_TITLE_MAX_LENGTH}
          </span>
        </div>
        <Input
          id={`${idBase}-title`}
          placeholder="Título da publicação"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          className={postComposerFieldStyles.input}
          maxLength={POST_COMPOSER_TITLE_MAX_LENGTH}
          disabled={fieldsDisabled}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idBase}-content`} className="text-sm font-medium text-[var(--woody-text)]">
          Conteúdo
        </label>
        <Textarea
          id={`${idBase}-content`}
          placeholder={contentPlaceholder}
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          rows={4}
          disabled={fieldsDisabled}
          className={cn(postComposerFieldStyles.textarea, "min-h-24 resize-none sm:resize-y")}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idBase}-tags`} className="text-sm font-medium text-[var(--woody-text)]">
          Tags{" "}
          <span className="font-normal text-[var(--woody-muted)]">
            (opcional, até {POST_COMPOSER_TAGS_MAX_COUNT}, separadas por vírgula)
          </span>
        </label>
        <Input
          id={`${idBase}-tags`}
          placeholder="ex.: bem-estar, dúvida"
          value={tagsRaw}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTagsRaw(e.target.value)}
          disabled={fieldsDisabled}
          className={postComposerFieldStyles.input}
        />
      </div>

      {/* Secção de mídia */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--woody-text)]">Fotos ou vídeo</span>
          {hasImages && (
            <span
              className={cn(
                "text-xs tabular-nums font-medium",
                imagesFull ? "text-[var(--woody-accent)]" : "text-[var(--woody-muted)]"
              )}
            >
              {imageItems.length}/{POST_COMPOSER_IMAGES_MAX_COUNT}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de imagem */}
          <MediaPicker
            fileInputRef={imageInputRef}
            accept="image/*"
            multiple
            onChange={onImageFilesChange}
            disabled={fieldsDisabled || hasVideo}
            buttonDisabled={imagesFull || hasVideo}
          >
            <ImagePlus className="size-4" aria-hidden />
            {hasImages
              ? imagesFull
                ? "Máximo atingido"
                : "Adicionar foto"
              : "Adicionar foto"}
          </MediaPicker>

          {/* Botão de vídeo (só quando não há imagens) */}
          {!hasImages && (
            <MediaPicker
              fileInputRef={videoInputRef}
              accept="video/mp4,video/webm,video/quicktime"
              onChange={onVideoFileChange}
              disabled={fieldsDisabled || hasImages}
              buttonDisabled={hasVideo || hasImages}
            >
              <Video className="size-4" aria-hidden />
              {hasVideo ? "Vídeo adicionado" : "Adicionar vídeo"}
            </MediaPicker>
          )}
        </div>

        <p className="text-[0.7rem] leading-snug text-[var(--woody-muted)]">
          Até {POST_COMPOSER_IMAGES_MAX_COUNT} fotos (máx. {formatFileSize(POST_COMPOSER_IMAGE_MAX_BYTES)} cada) · ou 1
          vídeo MP4/WebM/MOV até {formatFileSize(POST_COMPOSER_VIDEO_MAX_BYTES)} e{" "}
          {POST_COMPOSER_VIDEO_MAX_DURATION_SEC} s
        </p>

        <MediaPreviewGrid
          items={previewItems}
          onRemove={removePreview}
          disabled={fieldsDisabled}
        />
      </div>

      {formError && (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-900 dark:text-red-200"
          role="alert"
        >
          {formError}
        </p>
      )}

      <div className="flex justify-end pt-1">
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitDisabled}
          className="rounded-xl h-9 px-5 bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 active:bg-[var(--woody-nav)]/80 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              A publicar…
            </>
          ) : (
            "Publicar"
          )}
        </Button>
      </div>
    </div>
  );
}
