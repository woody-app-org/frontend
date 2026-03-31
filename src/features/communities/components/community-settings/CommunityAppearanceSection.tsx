import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { COMMUNITY_MOCK_IMAGE_MAX_BYTES, readFileAsDataUrl } from "../../lib/communityImageMock";

export interface CommunityAppearanceSectionProps {
  formId: string;
  /** Título atual para iniciais no avatar. */
  communityName: string;
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
  avatarUrl,
  coverUrl,
  onAvatarChange,
  onCoverChange,
  onFileError,
}: CommunityAppearanceSectionProps) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined, kind: "avatar" | "cover") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onFileError("Use uma imagem (JPG, PNG, etc.).");
      return;
    }
    if (file.size > COMMUNITY_MOCK_IMAGE_MAX_BYTES) {
      onFileError("Arquivo grande demais (máx. ~2,5 MB neste mock).");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      if (kind === "avatar") onAvatarChange(url);
      else onCoverChange(url);
      onFileError(null);
    } catch {
      onFileError("Não foi possível carregar a imagem.");
    }
  };

  return (
    <section className="space-y-4" aria-labelledby={`${formId}-appearance`}>
      <h3 id={`${formId}-appearance`} className="text-sm font-semibold text-[var(--woody-text)]">
        Aparência
      </h3>
      <p className="text-xs text-[var(--woody-muted)] leading-relaxed">
        Ícone e capa aparecem no topo da comunidade. Imagens são convertidas para visualização local (mock).
      </p>

      <div className="overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5">
        <div className="h-24 sm:h-28 w-full">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
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
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void handleFile(f, "cover");
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("rounded-lg border-[var(--woody-accent)]/25 bg-[var(--woody-bg)]", woodyFocus.ring)}
            onClick={() => coverRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            Capa
          </Button>
          {coverUrl ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onCoverChange(null)}>
              Remover capa
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            void handleFile(f, "avatar");
          }}
        />
        <div className="relative size-20 shrink-0 sm:size-24">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-full rounded-2xl border-4 border-[var(--woody-card)] object-cover shadow-md" />
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
          >
            <ImagePlus className="size-4" />
          </Button>
        </div>
        {avatarUrl ? (
          <Button type="button" variant="ghost" size="sm" className="sm:mt-6" onClick={() => onAvatarChange(null)}>
            Remover ícone
          </Button>
        ) : null}
      </div>
    </section>
  );
}
