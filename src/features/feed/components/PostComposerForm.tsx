import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Community, Post } from "@/domain/types";
import { fetchMyCommunitiesForComposer } from "@/features/communities/services/community.service";
import { postComposerFieldStyles } from "../lib/postComposerFieldStyles";
import {
  POST_COMPOSER_TAGS_MAX_COUNT,
  POST_COMPOSER_TITLE_MAX_LENGTH,
  createPost,
  normalizePostComposerTags,
  readImageFileAsDataUrlIfSmall,
} from "../services/post.service";

const selectClass = cn(
  postComposerFieldStyles.input,
  "w-full appearance-none bg-[var(--woody-bg)] pr-9 cursor-pointer"
);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(!forcedCommunity);
  const [communityId, setCommunityId] = useState(forcedCommunity?.id ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [communityLoadError, setCommunityLoadError] = useState(false);
  const [communityReloadKey, setCommunityReloadKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (composerFeedback === "full" && showSuccess) {
      const t = window.setTimeout(() => setShowSuccess(false), 3200);
      return () => window.clearTimeout(t);
    }
  }, [composerFeedback, showSuccess]);

  useEffect(() => {
    if (forcedCommunity) {
      setCommunityId(forcedCommunity.id);
      setLoadingCommunities(false);
      setCommunityLoadError(false);
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
  }, [forcedCommunity, initialCommunityId, communityReloadKey]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImageUrlInput("");
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onPickFile = useCallback(() => fileInputRef.current?.click(), []);

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFormError("Escolha um ficheiro de imagem.");
      return;
    }
    setFormError(null);
    setImageFile(f);
    setImageUrlInput("");
  }, []);

  const handleSubmit = async () => {
    setFormError(null);
    const cid = forcedCommunity?.id ?? communityId;
    if (!cid) {
      setFormError("Escolha uma comunidade.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setFormError("Preencha o título e o conteúdo.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      let imageUrls: string[] | undefined;

      const urlTrim = imageUrlInput.trim();
      if (urlTrim) {
        imageUrl = urlTrim;
      } else if (imageFile) {
        const dataUrl = await readImageFileAsDataUrlIfSmall(imageFile);
        imageUrls = [dataUrl];
      }

      const tags = normalizePostComposerTags(tagsRaw);

      const post = await createPost(
        {
          communityId: cid,
          title: title.trim(),
          content: content.trim(),
          tags: tags.length ? tags : undefined,
          imageUrl: imageUrl ?? null,
          imageUrls,
        },
        viewerId
      );

      setTitle("");
      setContent("");
      setTagsRaw("");
      clearImage();
      if (composerFeedback === "full") setShowSuccess(true);
      onPostCreated?.(post);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Falha ao publicar.");
    } finally {
      setSubmitting(false);
    }
  };

  const canPickCommunity = !forcedCommunity;
  const noMemberships =
    !forcedCommunity && !loadingCommunities && !communityLoadError && myCommunities.length === 0;
  const submitDisabled =
    submitting ||
    noMemberships ||
    (!forcedCommunity && !communityId) ||
    !title.trim() ||
    !content.trim();

  const previewSrc = imagePreviewUrl ?? (imageUrlInput.trim() ? imageUrlInput.trim() : null);
  const fieldsDisabled = submitting || loadingCommunities;

  return (
    <div
      className={cn("space-y-3", className)}
      aria-busy={submitting}
    >
      {composerFeedback === "full" && showSuccess && (
        <p
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-950 dark:text-emerald-100"
          role="status"
          aria-live="polite"
        >
          Publicação criada com sucesso.
        </p>
      )}

      {canPickCommunity && (
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
              Precisa de participar numa comunidade para publicar.{" "}
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
          placeholder="Partilhe algo com a comunidade…"
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

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--woody-text)]">Imagem</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-hidden
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-[var(--woody-accent)]/25"
            onClick={onPickFile}
            disabled={fieldsDisabled || !!imageUrlInput.trim()}
          >
            <ImagePlus className="size-4" aria-hidden />
            Escolher ficheiro
          </Button>
          <span className="text-xs text-[var(--woody-muted)]">ou cole um URL abaixo</span>
        </div>
        <Input
          placeholder="https://… (URL público da imagem)"
          value={imageUrlInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setImageUrlInput(e.target.value);
            if (e.target.value.trim()) setImageFile(null);
          }}
          disabled={fieldsDisabled || !!imageFile}
          className={postComposerFieldStyles.input}
        />
        {previewSrc && (
          <div className="relative mt-2 overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5">
            <img src={previewSrc} alt="Pré-visualização" className="max-h-56 w-full object-contain" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 size-9 rounded-full shadow-md"
              onClick={clearImage}
              disabled={fieldsDisabled}
              aria-label="Remover imagem"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
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
