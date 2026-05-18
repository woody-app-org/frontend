import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Loader2, UserRound, Users, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Community, Post, PostPublicationContext, User } from "@/domain/types";
import { fetchMyCommunitiesForComposer } from "@/features/communities/services/community.service";
import {
  POST_COMPOSER_CONTENT_MAX_LENGTH,
  createPost,
  type CreatePostMediaAttachmentPayload,
} from "../services/post.service";
import { hashtagsToApiTags } from "../lib/postComposerHashtags";
import { mediaTypeFromUpload, uploadImageMedia, uploadVideoMedia } from "@/lib/mediaUpload";
import { readVideoDurationSeconds } from "@/lib/readVideoDurationSeconds";
import { extractVideoPosterJpegBlob } from "@/lib/extractVideoPosterJpeg";
import {
  POST_COMPOSER_IMAGE_MAX_BYTES,
  POST_COMPOSER_IMAGES_MAX_COUNT,
  POST_COMPOSER_VIDEO_MAX_BYTES,
  POST_COMPOSER_VIDEO_MAX_DURATION_SEC,
  formatFileSize,
} from "@/domain/postMediaLimits";
import { MediaPicker } from "@/components/media/MediaPicker";
import { MediaPreviewGrid, type MediaPreviewItem } from "@/components/media/MediaPreviewGrid";
import { showSuccessToast, showActionErrorToast } from "@/lib/toast";
import { HashtagChipsField } from "./HashtagChipsField";

const selectClass = cn(
  "h-10 w-full appearance-none cursor-pointer rounded-2xl border border-black/[0.06] bg-black/[0.03] px-3 pr-9 text-sm text-[var(--woody-text)]",
  "focus-visible:border-[var(--woody-accent)]/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/18"
);

const VIDEO_MIME_OK = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function targetOptionClass(selected: boolean) {
  return cn(
    "flex w-full cursor-pointer items-start gap-2.5 rounded-2xl border px-3 py-2 text-left text-sm transition-colors",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--woody-accent)]/25",
    selected
      ? "border-[var(--woody-nav)]/35 bg-[var(--woody-nav)]/8 text-[var(--woody-text)]"
      : "border-transparent bg-black/[0.03] text-[var(--woody-text)] hover:bg-[var(--woody-accent)]/8"
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const toolbarIconBtn = cn(
  "size-9 shrink-0 rounded-full border-0 bg-transparent text-[var(--woody-nav)] shadow-none sm:size-10",
  "hover:bg-[var(--woody-accent)]/14 active:scale-[0.97] disabled:opacity-40",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35"
);

const textareaSocial = cn(
  "field-sizing-auto min-h-[5.5rem] w-full resize-none rounded-2xl border-0 bg-transparent py-1.5 pl-1 pr-0.5 sm:pl-1.5 sm:pr-1",
  "text-[1.125rem] leading-[1.5] text-[var(--woody-text)] sm:text-[1.2rem] sm:leading-[1.45]",
  "placeholder:text-[var(--woody-muted)]/75",
  "shadow-none outline-none ring-0 transition-[box-shadow] duration-150",
  "focus-visible:ring-0 focus-visible:outline-none",
  "max-h-[min(42dvh,20rem)] overflow-y-auto"
);

/** Tipografia maior no compositor em modal (referência Twitter/X); telemóvel ligeiramente menor. */
const textareaSocialModal = cn(
  "min-h-[4.25rem] max-h-[min(34dvh,13rem)] text-[1.08rem] leading-snug",
  "sm:min-h-[6.5rem] sm:max-h-[min(50dvh,26rem)] sm:text-[1.38rem] sm:leading-snug"
);

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
  posterUrl?: string;
}

export interface PostComposerFormProps {
  viewerId: string;
  /** Cabeçalho compacto estilo rede social (avatar + nome). */
  viewerPreview: User;
  /** Publicação sempre nesta comunidade (ex.: página da comunidade). */
  forcedCommunity?: Community;
  /**
   * Só perfil: esconde a escolha perfil/comunidade (ex.: modal aberto a partir do feed geral).
   * Incompatível com `forcedCommunity` (prioridade da comunidade forçada).
   */
  forceProfilePublication?: boolean;
  /** Pré-selecionar comunidade no feed quando não está fixada. */
  initialCommunityId?: string;
  /** Quando <code>modal</code>, layout em coluna com área a rolar e barra inferior fixa (ex.: <code>CreatePostModal</code>). */
  embedMode?: "default" | "modal";
  onPostCreated?: (post: Post) => void;
  className?: string;
}

export function PostComposerForm({
  viewerId,
  viewerPreview,
  forcedCommunity,
  forceProfilePublication = false,
  initialCommunityId,
  onPostCreated,
  embedMode = "default",
  className,
}: PostComposerFormProps) {
  const idBase = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isModalEmbed = embedMode === "modal";

  const [publishTarget, setPublishTarget] = useState<PostPublicationContext>(() => {
    if (forcedCommunity) return "community";
    if (forceProfilePublication) return "profile";
    if (initialCommunityId) return "community";
    return "profile";
  });

  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [communityId, setCommunityId] = useState(forcedCommunity?.id ?? "");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [imageItems, setImageItems] = useState<ComposerImageItem[]>([]);
  const [videoItem, setVideoItem] = useState<ComposerVideoItem | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [communityLoadError, setCommunityLoadError] = useState(false);
  const [communityReloadKey, setCommunityReloadKey] = useState(0);

  const isCommunityFlow = !!forcedCommunity || publishTarget === "community";
  const canPickTarget = !forcedCommunity && !forceProfilePublication;

  const hasMediaQueued = imageItems.length > 0 || videoItem !== null;
  const hasText = content.trim().length > 0;

  const resizeContentArea = useCallback(() => {
    const el = contentTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (typeof window === "undefined") return;
    const narrowMobile = window.innerWidth < 640;
    const cap = Math.min(
      window.innerHeight * (isModalEmbed ? (narrowMobile ? 0.34 : 0.5) : 0.42),
      isModalEmbed ? (narrowMobile ? 220 : 420) : 320
    );
    const minPx = isModalEmbed ? (narrowMobile ? 72 : 96) : 88;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minPx), cap)}px`;
  }, [isModalEmbed]);

  useLayoutEffect(() => {
    resizeContentArea();
  }, [content, resizeContentArea]);

  const activeCommunityForToolbar = useMemo((): Community | null => {
    if (forcedCommunity) return forcedCommunity;
    if (publishTarget !== "community") return null;
    return myCommunities.find((c) => c.id === communityId) ?? null;
  }, [communityId, forcedCommunity, myCommunities, publishTarget]);

  useEffect(() => {
    return () => {
      imageItems.forEach((it) => URL.revokeObjectURL(it.previewUrl));
      if (videoItem) {
        URL.revokeObjectURL(videoItem.previewUrl);
        if (videoItem.posterUrl) URL.revokeObjectURL(videoItem.posterUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    void (async () => {
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

  useEffect(() => {
    if (forceProfilePublication && !forcedCommunity) {
      setPublishTarget("profile");
      setFormError(null);
    }
  }, [forceProfilePublication, forcedCommunity]);

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
        setVideoItem((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev.previewUrl);
            if (prev.posterUrl) URL.revokeObjectURL(prev.posterUrl);
          }
          return { file: f, previewUrl: URL.createObjectURL(f) };
        });

        try {
          const posterBlob = await extractVideoPosterJpegBlob(f);
          if (!posterBlob) return;
          const posterUrl = URL.createObjectURL(posterBlob);
          setVideoItem((prev) => {
            if (!prev || prev.file !== f) {
              URL.revokeObjectURL(posterUrl);
              return prev ?? null;
            }
            if (prev.posterUrl) URL.revokeObjectURL(prev.posterUrl);
            return { ...prev, posterUrl };
          });
        } catch {
          /* sem miniatura */
        }
      })();
    },
    [imageItems.length]
  );

  const removeVideo = useCallback(() => {
    setVideoItem((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.previewUrl);
        if (prev.posterUrl) URL.revokeObjectURL(prev.posterUrl);
      }
      return null;
    });
    setFormError(null);
  }, []);

  const previewItems = useMemo((): MediaPreviewItem[] => {
    const imgs: MediaPreviewItem[] = imageItems.map((it) => ({
      id: it.id,
      previewUrl: it.previewUrl,
      kind: "image" as const,
    }));
    const vid: MediaPreviewItem[] = videoItem
      ? [
          {
            id: "video",
            previewUrl: videoItem.previewUrl,
            kind: "video" as const,
            ...(videoItem.posterUrl ? { posterUrl: videoItem.posterUrl } : {}),
          },
        ]
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

  const handleSubmit = async () => {
    setFormError(null);

    const context: PostPublicationContext = forcedCommunity
      ? "community"
      : forceProfilePublication
        ? "profile"
        : publishTarget;

    if (context === "community") {
      const cid = forcedCommunity?.id ?? communityId;
      if (!cid) {
        setFormError("Escolhe uma comunidade.");
        return;
      }
    }

    const text = content.trim();
    if (!text && !hasMediaQueued) {
      setFormError("Escreve algo ou anexa uma imagem ou vídeo.");
      return;
    }
    if (text.length > POST_COMPOSER_CONTENT_MAX_LENGTH) {
      setFormError(`O texto pode ter no máximo ${POST_COMPOSER_CONTENT_MAX_LENGTH} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
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

        let thumbnailUrl: string | undefined;
        try {
          const posterBlob = await extractVideoPosterJpegBlob(videoItem.file);
          if (posterBlob) {
            try {
              const posterFile = new File([posterBlob], "poster.jpg", { type: "image/jpeg" });
              const thumbUp = await uploadImageMedia(posterFile, uploadCtx);
              thumbnailUrl = thumbUp.url;
            } catch {
              /* continua sem poster */
            }
          }
        } catch {
          /* sem thumbnail */
        }

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
            ...(thumbnailUrl ? { thumbnailUrl } : {}),
          },
        ];
      } else if (imageItems.length > 0) {
        const results = await Promise.all(
          imageItems.map(async (item) => {
            const f = item.file;
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

      const tags = hashtagsToApiTags(hashtags);

      const post = await createPost(
        {
          publicationContext: context,
          communityId: context === "community" ? (forcedCommunity?.id ?? communityId) : undefined,
          content: text,
          tags: tags.length ? tags : undefined,
          mediaAttachments,
        },
        viewerId
      );

      setContent("");
      setHashtags([]);
      setImageItems((prev) => {
        prev.forEach((it) => URL.revokeObjectURL(it.previewUrl));
        return [];
      });
      setVideoItem((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev.previewUrl);
          if (prev.posterUrl) URL.revokeObjectURL(prev.posterUrl);
        }
        return null;
      });

      showSuccessToast("Publicação criada com sucesso.", { id: "woody-post-created" });
      onPostCreated?.(post);
    } catch (err) {
      showActionErrorToast(err, "Falha ao publicar.");
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

  const submitDisabled =
    submitting || communityBlocking || (!hasText && !hasMediaQueued) || content.length > POST_COMPOSER_CONTENT_MAX_LENGTH;

  const mainPlaceholder = "Uma foto, um pensamento, um caos compartilhado";

  const hasImages = imageItems.length > 0;
  const hasVideo = videoItem !== null;
  const imagesFull = imageItems.length >= POST_COMPOSER_IMAGES_MAX_COUNT;

  const destinationControls = (
    <>
      {canPickTarget && (
        <div className="space-y-1.5">
          <span id={`${idBase}-target-legend`} className="sr-only">
            Onde publicar
          </span>
          <div
            className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
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
                <span className="block font-medium leading-tight">Perfil</span>
                <span className="mt-0.5 block text-[0.7rem] font-normal text-[var(--woody-muted)]">No teu espaço</span>
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
                <span className="block font-medium leading-tight">Comunidade</span>
                <span className="mt-0.5 block text-[0.7rem] font-normal text-[var(--woody-muted)]">
                  Onde participas
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      {isCommunityFlow && !forcedCommunity && (
        <div className="space-y-1">
          {loadingCommunities ? (
            <div className="flex h-10 items-center gap-2 rounded-2xl border border-black/[0.06] bg-black/[0.02] px-3 text-sm text-[var(--woody-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              A carregar…
            </div>
          ) : communityLoadError ? (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
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
            <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-100">
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
              <label htmlFor={`${idBase}-community`} className="sr-only">
                Escolher comunidade
              </label>
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
    </>
  );

  return (
    <div
      className={cn(isModalEmbed ? "flex min-h-0 flex-1 flex-col" : "flex flex-col gap-3", className)}
      aria-busy={submitting}
    >
      <div
        className={cn(
          isModalEmbed &&
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-1 pt-0 sm:px-5 sm:pb-2",
          !isModalEmbed && "space-y-3"
        )}
      >
        <div className="flex items-start gap-2.5 sm:gap-3.5">
          <Avatar
            className={cn(
              "mt-0.5 shrink-0 ring-1 ring-black/[0.06]",
              isModalEmbed ? "size-10 sm:size-11 lg:size-12" : "size-10 sm:size-11"
            )}
          >
            <AvatarImage src={viewerPreview.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs font-semibold text-[var(--woody-text)]">
              {getInitials(viewerPreview.name)}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "min-w-0 flex-1",
              isModalEmbed ? "space-y-2 sm:space-y-3" : "space-y-2.5 sm:space-y-3"
            )}
          >
            <span className="sr-only">
              {viewerPreview.name}
              {viewerPreview.pronouns ? `, ${viewerPreview.pronouns}` : ""} — @{viewerPreview.username}
            </span>

            {isModalEmbed ? (
              <>
                <Textarea
                  ref={contentTextareaRef}
                  id={`${idBase}-content`}
                  placeholder={mainPlaceholder}
                  value={content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setContent(e.target.value);
                    requestAnimationFrame(() => resizeContentArea());
                  }}
                  disabled={fieldsDisabled}
                  className={cn(textareaSocial, textareaSocialModal)}
                  maxLength={POST_COMPOSER_CONTENT_MAX_LENGTH}
                  rows={1}
                  aria-label="Texto da publicação"
                />
                {destinationControls}
              </>
            ) : (
              <>
                {destinationControls}
                <Textarea
                  ref={contentTextareaRef}
                  id={`${idBase}-content`}
                  placeholder={mainPlaceholder}
                  value={content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setContent(e.target.value);
                    requestAnimationFrame(() => resizeContentArea());
                  }}
                  disabled={fieldsDisabled}
                  className={textareaSocial}
                  maxLength={POST_COMPOSER_CONTENT_MAX_LENGTH}
                  rows={1}
                  aria-label="Texto da publicação"
                />
              </>
            )}

            <HashtagChipsField
              hashtags={hashtags}
              onHashtagsChange={setHashtags}
              disabled={fieldsDisabled}
              compact
              composerBare={isModalEmbed}
            />

            <MediaPreviewGrid
              items={previewItems}
              onRemove={removePreview}
              disabled={fieldsDisabled}
              variant={isModalEmbed ? "composer" : "default"}
            />

            {formError && (
              <p
                className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-sm text-red-900 dark:text-red-200"
                role="alert"
              >
                {formError}
              </p>
            )}

            {!isModalEmbed && (
              <p className="text-[0.65rem] leading-snug text-[var(--woody-muted)]/85">
                Até {POST_COMPOSER_IMAGES_MAX_COUNT} fotos ({formatFileSize(POST_COMPOSER_IMAGE_MAX_BYTES)} cada) ou 1
                vídeo até {formatFileSize(POST_COMPOSER_VIDEO_MAX_BYTES)} / {POST_COMPOSER_VIDEO_MAX_DURATION_SEC}s ·{" "}
                {content.length}/{POST_COMPOSER_CONTENT_MAX_LENGTH}
              </p>
            )}
            {isModalEmbed ? (
              <p className="sr-only">
                Limite: até {POST_COMPOSER_IMAGES_MAX_COUNT} fotos ({formatFileSize(POST_COMPOSER_IMAGE_MAX_BYTES)}{" "}
                cada) ou 1 vídeo até {formatFileSize(POST_COMPOSER_VIDEO_MAX_BYTES)} /{" "}
                {POST_COMPOSER_VIDEO_MAX_DURATION_SEC}s. Caracteres: {content.length} de{" "}
                {POST_COMPOSER_CONTENT_MAX_LENGTH}.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-2 backdrop-blur-md",
          isModalEmbed
            ? "border-t border-black/[0.05] bg-transparent px-3 py-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-2.5 sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            : "border-t border-black/[0.06] bg-[var(--woody-card)]/92 pt-3"
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {activeCommunityForToolbar ? (
            <span
              className="inline-flex shrink-0"
              title={activeCommunityForToolbar.name}
              aria-label={`Publicação na comunidade ${activeCommunityForToolbar.name}`}
            >
              <Avatar className="size-9 ring-1 ring-black/[0.08] sm:size-10">
                <AvatarImage src={activeCommunityForToolbar.avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[0.65rem] font-semibold text-[var(--woody-text)]">
                  {getInitials(activeCommunityForToolbar.name)}
                </AvatarFallback>
              </Avatar>
            </span>
          ) : null}
          <MediaPicker
            fileInputRef={imageInputRef}
            accept="image/*"
            multiple
            onChange={onImageFilesChange}
            disabled={fieldsDisabled || hasVideo}
            buttonDisabled={imagesFull || hasVideo}
            buttonClassName={toolbarIconBtn}
            buttonTitle="Adicionar imagens"
          >
            <ImagePlus className="size-[1.15rem] sm:size-5" aria-hidden />
          </MediaPicker>

          {!hasImages && (
            <MediaPicker
              fileInputRef={videoInputRef}
              accept="video/mp4,video/webm,video/quicktime"
              onChange={onVideoFileChange}
              disabled={fieldsDisabled || hasImages}
              buttonDisabled={hasVideo || hasImages}
              buttonClassName={toolbarIconBtn}
              buttonTitle="Adicionar vídeo"
            >
              <Video className="size-[1.15rem] sm:size-5" aria-hidden />
            </MediaPicker>
          )}
          {hasImages ? (
            <span className="text-[0.65rem] tabular-nums text-[var(--woody-muted)]">
              {imageItems.length}/{POST_COMPOSER_IMAGES_MAX_COUNT}
            </span>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitDisabled}
          className={cn(
            "h-9 shrink-0 rounded-full shadow-none transition-colors sm:h-9",
            isModalEmbed
              ? submitDisabled
                ? "border-0 bg-black/[0.07] px-4 text-[0.8125rem] font-bold text-[var(--woody-muted)] hover:bg-black/[0.07] sm:px-5 sm:text-sm"
                : "border-0 bg-[var(--woody-nav)] px-4 text-[0.8125rem] font-bold text-white hover:bg-[var(--woody-nav)]/90 sm:h-10 sm:px-6 sm:text-sm"
              : cn(
                  "border px-4 text-sm font-semibold",
                  "border-[var(--woody-nav)]/35 bg-transparent text-[var(--woody-nav)]",
                  "hover:bg-[var(--woody-nav)]/10 hover:border-[var(--woody-nav)]/45",
                  "disabled:pointer-events-none disabled:opacity-40",
                  submitDisabled && "opacity-40"
                )
          )}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin shrink-0" aria-hidden />
              A publicar…
            </span>
          ) : (
            "Publicar"
          )}
        </Button>
      </div>
    </div>
  );
}
