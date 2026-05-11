import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyContext, woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import type { InterestTag, UserProfile } from "../types";
import { updateProfile, validateProfileUpdatePayload } from "../services/profile.service";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { ImageCropDialog } from "@/components/media/ImageCropDialog";
import { uploadImageMedia } from "@/lib/mediaUpload";
import { resolvePublicMediaUrl } from "@/lib/api";
import {
  PROFILE_IMAGE_ACCEPT_ATTR,
  validateProfileImageForCrop,
} from "../lib/profileImageValidation";

const inputClass =
  "rounded-xl border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] " +
  "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20 shadow-none";

const fileMaxBytes = 2_500_000;

/**
 * Proporção da área de crop da capa, alinhada ao banner do `ProfileHeader` (faixa larga e baixa).
 * 16:5 ≈ 3,2:1 — ponto médio entre ~3:1 e o strip panorâmico em viewports largas.
 */
const PROFILE_BANNER_CROP_ASPECT = 16 / 5;
const PROFILE_BANNER_OUTPUT_W = 2000;
const PROFILE_BANNER_OUTPUT_H = Math.round(PROFILE_BANNER_OUTPUT_W / PROFILE_BANNER_CROP_ASPECT);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parseInterestsField(raw: string, previous: InterestTag[]): InterestTag[] {
  const parts = raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.map((label, idx) => {
    const match = previous.find((p) => p.label.toLowerCase() === label.toLowerCase());
    if (match) return { ...match };
    const slug = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32);
    return { id: `int-${slug}-${idx}`, label };
  });
}

function interestsToField(interests: InterestTag[]): string {
  return interests.map((i) => i.label).join(", ");
}

export interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
}

export function EditProfileDialog({ open, onOpenChange, profile, onSaved }: EditProfileDialogProps) {
  const formId = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [interestsRaw, setInterestsRaw] = useState(interestsToField(profile.interests));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState<string | null>(profile.bannerUrl);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [bannerCropOpen, setBannerCropOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);

  const displayBannerUrl = useMemo(
    () => (bannerUrl ? resolvePublicMediaUrl(bannerUrl) : ""),
    [bannerUrl]
  );
  const displayAvatarUrl = useMemo(
    () => (avatarUrl ? resolvePublicMediaUrl(avatarUrl) : ""),
    [avatarUrl]
  );

  const [bannerPreviewFailed, setBannerPreviewFailed] = useState(false);
  useEffect(() => {
    setBannerPreviewFailed(false);
  }, [bannerUrl]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setIsSubmitting(false);
      return;
    }
    const p = profileRef.current;
    setName(p.name);
    setUsername(p.username ?? "");
    setBio(p.bio);
    setPronouns(p.pronouns ?? "");
    setLocation(p.location ?? "");
    setProfession(p.profession ?? "");
    setInterestsRaw(interestsToField(p.interests));
    setAvatarUrl(p.avatarUrl);
    setBannerUrl(p.bannerUrl);
    setSubmitError(null);
  }, [open]);

  const dismissAvatarCrop = useCallback(() => {
    setAvatarCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarCropOpen(false);
  }, []);

  const dismissBannerCrop = useCallback(() => {
    setBannerCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setBannerCropOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      dismissAvatarCrop();
      dismissBannerCrop();
    }
  }, [open, dismissAvatarCrop, dismissBannerCrop]);

  const handleAvatarFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    const check = validateProfileImageForCrop(file);
    if (!check.ok) {
      showErrorToast(check.message, { id: "woody-profile-avatar-format" });
      return;
    }
    if (file.size > fileMaxBytes) {
      setSubmitError("Imagem muito grande (máx. ~2,5 MB).");
      return;
    }
    setSubmitError(null);
    dismissBannerCrop();
    const objectUrl = URL.createObjectURL(file);
    setAvatarCropSrc(objectUrl);
    setAvatarCropOpen(true);
  }, [dismissBannerCrop]);

  const handleAvatarCropConfirm = useCallback(
    async (file: File) => {
      try {
        const uploaded = await uploadImageMedia(file, {
          scope: "post",
          publicationContext: "profile",
        });
        setAvatarUrl(uploaded.url);
        dismissAvatarCrop();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Não foi possível enviar a foto. Tente novamente.",
          { id: "woody-profile-avatar-upload" }
        );
        throw err;
      }
    },
    [dismissAvatarCrop]
  );

  const handleBannerCropConfirm = useCallback(
    async (file: File) => {
      try {
        const uploaded = await uploadImageMedia(file, {
          scope: "post",
          publicationContext: "profile",
        });
        setBannerUrl(uploaded.url);
        dismissBannerCrop();
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Não foi possível enviar a capa. Tente novamente.",
          { id: "woody-profile-banner-upload" }
        );
        throw err;
      }
    },
    [dismissBannerCrop]
  );

  const handleBannerFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) {
        return;
      }
      const check = validateProfileImageForCrop(file);
      if (!check.ok) {
        showErrorToast(check.message, { id: "woody-profile-banner-format" });
        return;
      }
      if (file.size > fileMaxBytes) {
        setSubmitError("Banner muito grande (máx. ~2,5 MB).");
        return;
      }
      setSubmitError(null);
      dismissAvatarCrop();
      const objectUrl = URL.createObjectURL(file);
      setBannerCropSrc(objectUrl);
      setBannerCropOpen(true);
    },
    [dismissAvatarCrop]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const interests = parseInterestsField(interestsRaw, profile.interests);
      const payload = {
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        pronouns: pronouns.trim() || undefined,
        location: location.trim() || undefined,
        profession: profession.trim() || undefined,
        avatarUrl,
        bannerUrl,
        interests,
      };

      const v = validateProfileUpdatePayload(payload);
      if (!v.ok) {
        setSubmitError(v.error);
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await updateProfile(profile.id, payload);
        if (!result.ok) {
          setSubmitError(result.error);
          return;
        }
        showSuccessToast("Perfil atualizado.", { id: `woody-profile-updated-${profile.id}` });
        onSaved(result.profile);
        onOpenChange(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      name,
      username,
      bio,
      pronouns,
      location,
      profession,
      interestsRaw,
      avatarUrl,
      bannerUrl,
      profile.id,
      profile.interests,
      onOpenChange,
      onSaved,
    ]
  );

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "top-[5%] translate-y-0 sm:top-1/2 sm:-translate-y-1/2",
          "border-[var(--woody-accent)]/15"
        )}
      >
        <DialogHeader className="space-y-2 pr-8 text-left">
          <div className={cn(woodyContext.personalBadge)}>
            <User className="size-3.5 shrink-0" aria-hidden />
            Seu perfil
          </div>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-[var(--woody-text)]">
            <Pencil className="size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
            Ajustar meu perfil
          </DialogTitle>
          <DialogDescription>
            Só o seu perfil pessoal — não altera comunidades. No demo os dados ficam neste navegador; ao ligar a API,
            substitua a função em profile.service (mapa de rotas em lib/backendIntegrationHints).
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="mt-2 space-y-5" aria-busy={isSubmitting}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
              Banner
            </p>
            <div className="relative overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5">
              <div className="h-24 sm:h-28 w-full">
                {bannerUrl && displayBannerUrl && !bannerPreviewFailed ? (
                  <img
                    src={displayBannerUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => {
                      if (import.meta.env.DEV) {
                        console.warn("[Woody] Edit profile banner preview failed to load", displayBannerUrl);
                      }
                      setBannerPreviewFailed(true);
                    }}
                  />
                ) : bannerUrl ? (
                  <div
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--woody-nav)]/25 via-[var(--woody-accent)]/12 to-[var(--woody-nav)]/20 text-xs text-[var(--woody-muted)]"
                    aria-hidden
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--woody-muted)]">
                    Nenhuma imagem
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[var(--woody-accent)]/10 p-3">
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept={PROFILE_IMAGE_ACCEPT_ATTR}
                  className="sr-only"
                  onChange={handleBannerFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-lg border-[var(--woody-accent)]/25 bg-[var(--woody-bg)]",
                    woodyFocus.ring
                  )}
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                  Alterar banner
                </Button>
                {bannerUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[var(--woody-muted)]"
                    onClick={() => setBannerUrl(null)}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>
              <p className="border-t border-[var(--woody-accent)]/5 px-3 pb-3 pt-2 text-xs text-[var(--woody-muted)]">
                PNG ou JPG até ~2,5 MB. Ajuste o enquadramento panorâmico antes de enviar.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <input
              ref={avatarInputRef}
              type="file"
              accept={PROFILE_IMAGE_ACCEPT_ATTR}
              className="sr-only"
              onChange={handleAvatarFile}
            />
            <div className="relative">
              <Avatar className="size-24 border-4 border-[var(--woody-card)] shadow-md ring-2 ring-[var(--woody-accent)]/10">
                <AvatarImage
                  src={displayAvatarUrl || undefined}
                  alt=""
                  onError={() => {
                    if (import.meta.env.DEV) {
                      console.warn("[Woody] Edit profile avatar preview failed to load", displayAvatarUrl);
                    }
                  }}
                />
                <AvatarFallback className="bg-[var(--woody-nav)]/10 text-lg text-[var(--woody-text)]">
                  {getInitials(name || profile.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className={cn(
                  "absolute -bottom-1 -right-1 size-9 rounded-full border border-[var(--woody-accent)]/20 shadow-md",
                  woodyFocus.ring
                )}
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Alterar foto de perfil"
              >
                <Pencil className="size-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-[var(--woody-muted)] sm:mt-2 sm:flex-1 sm:text-left">
              PNG ou JPG até ~2,5 MB. Você ajusta o enquadramento e enviamos a foto de forma segura para o servidor.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor={`${formId}-name`} className="text-sm font-medium text-[var(--woody-text)]">
                Nome de exibição
              </label>
              <Input
                id={`${formId}-name`}
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                className={inputClass}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-username`} className="text-sm font-medium text-[var(--woody-text)]">
                Nome de usuário
              </label>
              <Input
                id={`${formId}-username`}
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                className={inputClass}
                autoComplete="username"
                required
              />
              <p className="text-xs text-[var(--woody-muted)]">Apenas letras minúsculas, números, . e _</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-pronouns`} className="text-sm font-medium text-[var(--woody-text)]">
                Pronomes
              </label>
              <Input
                id={`${formId}-pronouns`}
                value={pronouns}
                onChange={(ev) => setPronouns(ev.target.value)}
                className={inputClass}
                placeholder="ela/dela"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-profession`} className="text-sm font-medium text-[var(--woody-text)]">
                Título ou profissão
              </label>
              <Input
                id={`${formId}-profession`}
                value={profession}
                onChange={(ev) => setProfession(ev.target.value)}
                className={inputClass}
                placeholder="Educadora"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-location`} className="text-sm font-medium text-[var(--woody-text)]">
                Localização
              </label>
              <Input
                id={`${formId}-location`}
                value={location}
                onChange={(ev) => setLocation(ev.target.value)}
                className={inputClass}
                placeholder="Cidade, UF"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`${formId}-bio`} className="text-sm font-medium text-[var(--woody-text)]">
              Bio
            </label>
            <Textarea
              id={`${formId}-bio`}
              value={bio}
              onChange={(ev) => setBio(ev.target.value)}
              className={cn(inputClass, "min-h-[7rem] resize-y")}
              placeholder="Conte um pouco sobre você…"
            />
            <p className="text-xs text-[var(--woody-muted)] text-right tabular-nums">{bio.length}/500</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`${formId}-interests`} className="text-sm font-medium text-[var(--woody-text)]">
              Interesses
            </label>
            <Textarea
              id={`${formId}-interests`}
              value={interestsRaw}
              onChange={(ev) => setInterestsRaw(ev.target.value)}
              className={cn(inputClass, "min-h-[4.5rem] resize-y")}
              placeholder="Ex.: leitura, maternidade, comunidades seguras (separados por vírgula)"
            />
          </div>

          {submitError ? (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-h-11 w-full rounded-xl border-[var(--woody-accent)]/25 sm:w-auto",
                woodyFocus.ring
              )}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "min-h-11 w-full rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 active:scale-[0.98] sm:w-auto",
                woodyFocus.ring
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <ImageCropDialog
      open={avatarCropOpen}
      onOpenChange={(next) => {
        if (!next) dismissAvatarCrop();
        else setAvatarCropOpen(true);
      }}
      imageSrc={avatarCropSrc}
      title="Ajustar foto"
      description="Escolha o enquadramento que aparecerá no seu perfil."
      cropShape="round"
      aspect={1}
      layout="square"
      outputSize={512}
      onConfirm={handleAvatarCropConfirm}
    />

    <ImageCropDialog
      open={bannerCropOpen}
      onOpenChange={(next) => {
        if (!next) dismissBannerCrop();
        else setBannerCropOpen(true);
      }}
      imageSrc={bannerCropSrc}
      title="Ajustar capa"
      description="Veja como a imagem ficará na faixa do seu perfil antes de guardar."
      cropShape="rect"
      aspect={PROFILE_BANNER_CROP_ASPECT}
      layout="wide"
      outputWidth={PROFILE_BANNER_OUTPUT_W}
      outputHeight={PROFILE_BANNER_OUTPUT_H}
      onConfirm={handleBannerCropConfirm}
    />
    </>
  );
}
