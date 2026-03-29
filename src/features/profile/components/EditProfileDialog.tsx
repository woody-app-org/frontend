import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil } from "lucide-react";
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
import { woodyFocus } from "@/lib/woody-ui";
import type { InterestTag, UserProfile } from "../types";
import { updateProfile, validateProfileUpdatePayload } from "../services/profile.service";

const inputClass =
  "rounded-xl border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] " +
  "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20 shadow-none";

const fileMaxBytes = 2_500_000;

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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    r.readAsDataURL(file);
  });
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
  const [role, setRole] = useState(profile.role ?? "");
  const [interestsRaw, setInterestsRaw] = useState(interestsToField(profile.interests));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState<string | null>(profile.bannerUrl);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setSuccess(false);
      setIsSubmitting(false);
      return;
    }
    const p = profileRef.current;
    setName(p.name);
    setUsername(p.username ?? "");
    setBio(p.bio);
    setPronouns(p.pronouns ?? "");
    setLocation(p.location ?? "");
    setRole(p.role ?? "");
    setInterestsRaw(interestsToField(p.interests));
    setAvatarUrl(p.avatarUrl);
    setBannerUrl(p.bannerUrl);
    setSubmitError(null);
    setSuccess(false);
  }, [open]);

  const handleAvatarFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) {
        setSubmitError("Selecione uma imagem válida.");
        return;
      }
      if (file.size > fileMaxBytes) {
        setSubmitError("Imagem muito grande (máx. ~2,5 MB neste mock).");
        return;
      }
      try {
        const url = await readFileAsDataUrl(file);
        setAvatarUrl(url);
        setSubmitError(null);
      } catch {
        setSubmitError("Não foi possível carregar a foto.");
      }
    },
    []
  );

  const handleBannerFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) {
        setSubmitError("Selecione uma imagem válida para o banner.");
        return;
      }
      if (file.size > fileMaxBytes) {
        setSubmitError("Banner muito grande (máx. ~2,5 MB neste mock).");
        return;
      }
      try {
        const url = await readFileAsDataUrl(file);
        setBannerUrl(url);
        setSubmitError(null);
      } catch {
        setSubmitError("Não foi possível carregar o banner.");
      }
    },
    []
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
        role: role.trim() || undefined,
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
        setSuccess(true);
        onSaved(result.profile);
        window.setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
        }, 900);
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
      role,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(92vh,840px)] overflow-y-auto overflow-x-hidden",
          "top-[5%] translate-y-0 sm:top-1/2 sm:-translate-y-1/2",
          "border-[var(--woody-accent)]/15"
        )}
      >
        <DialogHeader className="text-left space-y-1 pr-8">
          <DialogTitle className="flex items-center gap-2 text-[var(--woody-text)]">
            <Pencil className="size-5 text-[var(--woody-nav)]" aria-hidden />
            Editar perfil
          </DialogTitle>
          <DialogDescription>
            Suas alterações ficam salvas neste dispositivo no modo demo. Em produção, serão enviadas ao servidor.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="mt-2 space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
              Banner
            </p>
            <div className="relative overflow-hidden rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5">
              <div className="h-24 sm:h-28 w-full">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
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
                  accept="image/*"
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
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarFile}
            />
            <div className="relative">
              <Avatar className="size-24 border-4 border-[var(--woody-card)] shadow-md ring-2 ring-[var(--woody-accent)]/10">
                <AvatarImage src={avatarUrl ?? undefined} alt="" />
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
              PNG ou JPG até ~2,5 MB. A imagem é convertida para pré-visualização local (mock).
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
              <label htmlFor={`${formId}-role`} className="text-sm font-medium text-[var(--woody-text)]">
                Título ou profissão
              </label>
              <Input
                id={`${formId}-role`}
                value={role}
                onChange={(ev) => setRole(ev.target.value)}
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

          {success ? (
            <p
              role="status"
              className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-200"
            >
              Perfil atualizado.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className={cn("rounded-xl border-[var(--woody-accent)]/25", woodyFocus.ring)}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || success}
              className={cn(
                "rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 active:scale-[0.98]",
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
  );
}
