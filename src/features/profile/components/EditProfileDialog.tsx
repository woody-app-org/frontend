import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, Pencil, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodyContext, woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const formAlertClass =
  "flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-800 dark:text-red-200";

function ProfileFormAlert({ message }: { message: string }) {
  return (
    <p role="alert" className={formAlertClass}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

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
  const formAlertRef = useRef<HTMLDivElement>(null);
  const bannerSectionRef = useRef<HTMLDivElement>(null);
  const avatarSectionRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [genderIdentity, setGenderIdentity] = useState(profile.genderIdentity ?? "");
  const [sexualOrientation, setSexualOrientation] = useState(profile.sexualOrientation ?? "");
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

  const [formError, setFormError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldErrors = useCallback(() => {
    setBannerError(null);
    setAvatarError(null);
  }, []);

  const showFormError = useCallback(
    (message: string) => {
      clearFieldErrors();
      setFormError(message);
    },
    [clearFieldErrors]
  );

  const showBannerError = useCallback(
    (message: string) => {
      setFormError(null);
      setAvatarError(null);
      setBannerError(message);
    },
    []
  );

  const showAvatarError = useCallback(
    (message: string) => {
      setFormError(null);
      setBannerError(null);
      setAvatarError(message);
    },
    []
  );

  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!open) {
      setFormError(null);
      setBannerError(null);
      setAvatarError(null);
      setIsSubmitting(false);
      return;
    }
    const p = profileRef.current;
    setName(p.name);
    setBio(p.bio);
    setPronouns(p.pronouns ?? "");
    setLocation(p.location ?? "");
    setProfession(p.profession ?? "");
    setGenderIdentity(p.genderIdentity ?? "");
    setSexualOrientation(p.sexualOrientation ?? "");
    setInterestsRaw(interestsToField(p.interests));
    setAvatarUrl(p.avatarUrl);
    setBannerUrl(p.bannerUrl);
    setFormError(null);
    setBannerError(null);
    setAvatarError(null);
  }, [open]);

  useEffect(() => {
    if (!formError) return;
    formAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [formError]);

  useEffect(() => {
    if (!bannerError) return;
    bannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [bannerError]);

  useEffect(() => {
    if (!avatarError) return;
    avatarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [avatarError]);

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
      showAvatarError("Imagem muito grande (máx. ~2,5 MB).");
      return;
    }
    clearFieldErrors();
    setFormError(null);
    dismissBannerCrop();
    const objectUrl = URL.createObjectURL(file);
    setAvatarCropSrc(objectUrl);
    setAvatarCropOpen(true);
  }, [dismissBannerCrop, showAvatarError, clearFieldErrors]);

  const handleAvatarCropConfirm = useCallback(
    async (file: File) => {
      try {
        const uploaded = await uploadImageMedia(file, {
          scope: "post",
          publicationContext: "profile",
        });
        setAvatarUrl(uploaded.url);
        setAvatarError(null);
        dismissAvatarCrop();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível enviar a foto. Tente novamente.";
        showAvatarError(message);
        showErrorToast(message, { id: "woody-profile-avatar-upload" });
        throw err;
      }
    },
    [dismissAvatarCrop, showAvatarError]
  );

  const handleBannerCropConfirm = useCallback(
    async (file: File) => {
      try {
        const uploaded = await uploadImageMedia(file, {
          scope: "post",
          publicationContext: "profile",
        });
        setBannerUrl(uploaded.url);
        setBannerError(null);
        dismissBannerCrop();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Não foi possível enviar a capa. Tente novamente.";
        showBannerError(message);
        showErrorToast(message, { id: "woody-profile-banner-upload" });
        throw err;
      }
    },
    [dismissBannerCrop, showBannerError]
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
        showBannerError("Banner muito grande (máx. ~2,5 MB).");
        return;
      }
      clearFieldErrors();
      setFormError(null);
      dismissAvatarCrop();
      const objectUrl = URL.createObjectURL(file);
      setBannerCropSrc(objectUrl);
      setBannerCropOpen(true);
    },
    [dismissAvatarCrop, showBannerError, clearFieldErrors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setBannerError(null);
      setAvatarError(null);
      const interests = parseInterestsField(interestsRaw, profile.interests);
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        pronouns: pronouns.trim() || undefined,
        location: location.trim() || undefined,
        profession: profession.trim() || undefined,
        genderIdentity: genderIdentity.trim() || undefined,
        sexualOrientation: sexualOrientation.trim() || undefined,
        avatarUrl,
        bannerUrl,
        interests,
      };

      const v = validateProfileUpdatePayload(payload);
      if (!v.ok) {
        showFormError(v.error);
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await updateProfile(profile.id, payload);
        if (!result.ok) {
          showFormError(result.error);
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
      bio,
      pronouns,
      location,
      profession,
      genderIdentity,
      sexualOrientation,
      interestsRaw,
      avatarUrl,
      bannerUrl,
      profile.id,
      profile.interests,
      onOpenChange,
      onSaved,
      showFormError,
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
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="mt-2 space-y-5" aria-busy={isSubmitting}>
          {formError ? (
            <div
              ref={formAlertRef}
              className="sticky top-0 z-10 -mx-0.5 scroll-mt-3 bg-[var(--woody-card)]/95 pb-2 backdrop-blur-sm"
            >
              <ProfileFormAlert message={formError} />
            </div>
          ) : null}

          <div ref={bannerSectionRef} className="space-y-3 scroll-mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
              Banner
            </p>
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border bg-[var(--woody-nav)]/5",
                bannerError
                  ? "border-red-500/40 ring-2 ring-red-500/20"
                  : "border-[var(--woody-accent)]/15"
              )}
            >
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
                    onClick={() => {
                      setBannerUrl(null);
                      setBannerError(null);
                    }}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>
              <p className="border-t border-[var(--woody-accent)]/5 px-3 pt-2 pb-3 text-xs leading-relaxed text-[var(--woody-muted)]">
                PNG ou JPG até ~2,5 MB. Ajuste o enquadramento panorâmico antes de enviar.
              </p>
              {bannerError ? (
                <div className="border-t border-red-500/15 px-3 pb-3 pt-2">
                  <ProfileFormAlert message={bannerError} />
                </div>
              ) : null}
            </div>
          </div>

          <div
            ref={avatarSectionRef}
            className={cn(
              "flex flex-col items-center gap-3 scroll-mt-3 sm:flex-row sm:items-start",
              avatarError && "rounded-xl ring-2 ring-red-500/20"
            )}
          >
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
            <div className="space-y-2 sm:mt-2 sm:flex-1">
              <p className="text-center text-xs text-[var(--woody-muted)] sm:text-left">
                PNG ou JPG até ~2,5 MB. Você ajusta o enquadramento e enviamos a foto de forma segura para o servidor.
              </p>
              {avatarError ? <ProfileFormAlert message={avatarError} /> : null}
            </div>
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
              <p className="text-sm font-medium text-[var(--woody-text)]">Username permanente</p>
              <div
                className={cn(
                  "flex min-h-10 cursor-not-allowed select-none items-center rounded-xl border border-[var(--woody-accent)]/15",
                  "bg-[var(--woody-muted)]/12 px-3 text-sm text-[var(--woody-muted)] shadow-none"
                )}
                aria-readonly="true"
                aria-disabled="true"
                title="Seu username não pode ser alterado"
              >
                @{profile.username ?? "—"}
              </div>
              <p className="text-xs text-[var(--woody-muted)]">
                Seu @ é permanente e não pode ser alterado.
              </p>
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
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--woody-text)]">
                Identidade de gênero
              </label>
              <Select
                value={genderIdentity || "none"}
                onValueChange={(v) => setGenderIdentity(v === "none" ? "" : v)}
                disabled={isSubmitting}
                modal={false}
              >
                <SelectTrigger
                  className={cn(
                    inputClass,
                    "h-10 w-full",
                    "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="none">Prefiro não informar</SelectItem>
                  <SelectItem value="Mulher cis">Mulher cis</SelectItem>
                  <SelectItem value="Mulher trans">Mulher trans</SelectItem>
                  <SelectItem value="Travesti">Travesti</SelectItem>
                  <SelectItem value="Não binária (espectro feminino)">Não binária (espectro feminino)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--woody-text)]">
                Orientação sexual
              </label>
              <Select
                value={sexualOrientation || "none"}
                onValueChange={(v) => setSexualOrientation(v === "none" ? "" : v)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={cn(
                    inputClass,
                    "h-10 w-full",
                    "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="none">Prefiro não informar</SelectItem>
                  <SelectItem value="Lésbica">Lésbica</SelectItem>
                  <SelectItem value="Bi">Bi</SelectItem>
                  <SelectItem value="Pan">Pan</SelectItem>
                  <SelectItem value="Hétero">Hétero</SelectItem>
                </SelectContent>
              </Select>
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
