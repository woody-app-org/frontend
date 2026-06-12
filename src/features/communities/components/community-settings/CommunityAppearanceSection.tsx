import { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { resolvePublicMediaUrl } from "@/lib/api";
import { uploadImageMedia } from "@/lib/mediaUpload";
import { ImageCropDialog } from "@/components/media/ImageCropDialog";
import { prepareImageForCrop } from "@/lib/image/canvasCropImage";
import {
  PROFILE_IMAGE_ACCEPT_ATTR,
  validateProfileImageForCrop,
} from "@/features/profile/lib/profileImageValidation";
import { showErrorToast } from "@/lib/toast";

const COVER_CROP_ASPECT = 3 / 1;
const COVER_OUTPUT_W = 1500;
const COVER_OUTPUT_H = Math.round(COVER_OUTPUT_W / COVER_CROP_ASPECT);

export interface CommunityAppearanceSectionProps {
  formId: string;
  /** Título atual para iniciais no avatar. */
  communityName: string;
  /** ID da comunidade, usado para enviar a imagem ao backend. */
  communityId: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  onCoverChange: (url: string | null) => void;
  onFileError: (message: string | null) => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommunityAppearanceSection({
  formId,
  communityName,
  communityId,
  avatarUrl,
  coverUrl,
  onAvatarChange,
  onCoverChange,
  onFileError,
}: CommunityAppearanceSectionProps) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);

  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [coverCropOpen, setCoverCropOpen] = useState(false);

  const displayAvatarUrl = useMemo(
    () => (avatarUrl ? resolvePublicMediaUrl(avatarUrl) : ""),
    [avatarUrl]
  );
  const displayCoverUrl = useMemo(
    () => (coverUrl ? resolvePublicMediaUrl(coverUrl) : ""),
    [coverUrl]
  );

  const dismissAvatarCrop = useCallback(() => {
    setAvatarCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarCropOpen(false);
  }, []);

  const dismissCoverCrop = useCallback(() => {
    setCoverCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCoverCropOpen(false);
  }, []);

  const pickFile = useCallback(
    (file: File | undefined, kind: "avatar" | "cover") => {
      if (!file) return;
      const check = validateProfileImageForCrop(file);
      if (!check.ok) {
        showErrorToast(check.message, { id: `woody-community-${kind}-format` });
        return;
      }
      onFileError(null);
      void prepareImageForCrop(file).then((objectUrl) => {
        if (kind === "avatar") {
          dismissCoverCrop();
          setAvatarCropSrc(objectUrl);
          setAvatarCropOpen(true);
        } else {
          dismissAvatarCrop();
          setCoverCropSrc(objectUrl);
          setCoverCropOpen(true);
        }
      });
    },
    [dismissAvatarCrop, dismissCoverCrop, onFileError]
  );

  const handleCropConfirm = useCallback(
    async (file: File, kind: "avatar" | "cover") => {
      setUploading(kind);
      try {
        const result = await uploadImageMedia(file, {
          scope: "post",
          publicationContext: "community",
          communityId,
        });
        if (kind === "avatar") {
          onAvatarChange(result.url);
          dismissAvatarCrop();
        } else {
          onCoverChange(result.url);
          dismissCoverCrop();
        }
        onFileError(null);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Não foi possível carregar a imagem.";
        onFileError(message);
        showErrorToast(message, { id: `woody-community-${kind}-upload` });
        throw e;
      } finally {
        setUploading(null);
      }
    },
    [communityId, dismissAvatarCrop, dismissCoverCrop, onAvatarChange, onCoverChange, onFileError]
  );

  return (
    <section className="space-y-4" aria-labelledby={`${formId}-appearance`}>
      <h3 id={`${formId}-appearance`} className="text-sm font-semibold text-[var(--woody-text)]">
        Aparência
      </h3>
      <p className="text-xs text-[var(--woody-muted)] leading-relaxed">
        Como admin de uma comunidade, você pode personalizar sua aparência, regras e visibilidade.
      </p>

      <div className="overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5">
        <div className="h-24 sm:h-28 w-full">
          {coverUrl ? (
            <img src={displayCoverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--woody-nav)]/10 text-xs text-[var(--woody-muted)]">
              Sem capa
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[var(--woody-accent)]/10 p-3">
          <input
            ref={coverRef}
            type="file"
            accept={PROFILE_IMAGE_ACCEPT_ATTR}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              pickFile(f, "cover");
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("rounded-lg border-[var(--woody-accent)]/25 bg-[var(--woody-bg)]", woodyFocus.ring)}
            onClick={() => coverRef.current?.click()}
            disabled={uploading !== null}
          >
            <ImagePlus className="size-4" />
            {uploading === "cover" ? "Enviando..." : "Capa"}
          </Button>
          {coverUrl ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onCoverChange(null)}>
              Remover capa
            </Button>
          ) : null}
        </div>
        <p className="px-3 pb-3 text-xs text-[var(--woody-muted)]">
          Tamanho recomendado: 1500 x 500px (proporção 3:1) · JPG ou PNG · até 2,5 MB.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <input
          ref={avatarRef}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT_ATTR}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            pickFile(f, "avatar");
          }}
        />
        <div className="relative size-20 shrink-0 sm:size-24">
          {avatarUrl ? (
            <img src={displayAvatarUrl} alt="" className="size-full rounded-2xl border-4 border-[var(--woody-card)] object-cover shadow-md" />
          ) : (
            <div className="flex size-full items-center justify-center rounded-2xl border-4 border-[var(--woody-card)] bg-[var(--woody-nav)]/15 text-lg font-bold text-[var(--woody-text)] shadow-md">
              {initials(communityName)}
            </div>
          )}
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className={cn(
              "absolute -bottom-1 -right-1 size-9 rounded-full border border-[var(--woody-accent)]/20 shadow-md",
              woodyFocus.ring
            )}
            onClick={() => avatarRef.current?.click()}
            aria-label="Alterar ícone da comunidade"
            disabled={uploading !== null}
          >
            <ImagePlus className="size-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-1.5 sm:items-start sm:mt-1">
          <p className="text-xs text-[var(--woody-muted)]">
            Tamanho recomendado: 400 x 400px (quadrado) · JPG ou PNG · até 2,5 MB.
          </p>
          {avatarUrl ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onAvatarChange(null)}>
              Remover ícone
            </Button>
          ) : null}
        </div>
      </div>

      <ImageCropDialog
        open={avatarCropOpen}
        onOpenChange={(next) => {
          if (!next) dismissAvatarCrop();
          else setAvatarCropOpen(true);
        }}
        imageSrc={avatarCropSrc}
        title="Ajustar ícone"
        description="Escolha o enquadramento que aparecerá como ícone da comunidade."
        cropShape="round"
        aspect={1}
        layout="square"
        outputSize={512}
        onConfirm={(file) => handleCropConfirm(file, "avatar")}
      />

      <ImageCropDialog
        open={coverCropOpen}
        onOpenChange={(next) => {
          if (!next) dismissCoverCrop();
          else setCoverCropOpen(true);
        }}
        imageSrc={coverCropSrc}
        title="Ajustar capa"
        description="Veja como a imagem ficará na faixa de capa da comunidade antes de guardar."
        cropShape="rect"
        aspect={COVER_CROP_ASPECT}
        layout="wide"
        outputWidth={COVER_OUTPUT_W}
        outputHeight={COVER_OUTPUT_H}
        onConfirm={(file) => handleCropConfirm(file, "cover")}
      />
    </section>
  );
}
