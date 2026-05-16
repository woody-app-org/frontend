import { useState, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Camera, ImagePlus, X } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { ONBOARDING_MAX_IMAGE_BYTES } from "../constants";
import { OnboardingStepHeader } from "../components/OnboardingStepHeader";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";
import { ImageCropDialog } from "@/components/media/ImageCropDialog";
import {
  PROFILE_IMAGE_ACCEPT_ATTR,
  validateProfileImageForCrop,
} from "@/features/profile/lib/profileImageValidation";

/**
 * Etapa 3 — foto de perfil: recorte local; upload após registo com JWT (ver `OnboardingStepComplete`).
 */
export function OnboardingStepProfilePhoto() {
  const { draft, updateDraft, pendingProfileAvatarPreviewUrl, setPendingProfileAvatar } =
    useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const preview = pendingProfileAvatarPreviewUrl ?? null;

  const dismissCropSession = useCallback(() => {
    setCropOpen(false);
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const openCropWithFile = useCallback((file: File) => {
    setError(null);
    const check = validateProfileImageForCrop(file);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    if (file.size > ONBOARDING_MAX_IMAGE_BYTES) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    dismissCropSession();
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropOpen(true);
  }, [dismissCropSession]);

  const processPickedFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      openCropWithFile(file);
    },
    [openCropWithFile]
  );

  const handleCropConfirm = useCallback(
    async (croppedFile: File) => {
      setPendingProfileAvatar(croppedFile);
      updateDraft({ skippedProfilePhoto: false });
      dismissCropSession();
    },
    [dismissCropSession, setPendingProfileAvatar, updateDraft]
  );

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    processPickedFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    processPickedFile(f);
  };

  const clearPhoto = () => {
    setPendingProfileAvatar(null);
    updateDraft({ skippedProfilePhoto: false });
    setError(null);
  };

  const skip = () => {
    setPendingProfileAvatar(null);
    updateDraft({ skippedProfilePhoto: true });
    goNext();
  };

  const continueWithPhoto = () => {
    updateDraft({ skippedProfilePhoto: false });
    goNext();
  };

  return (
    <div>
      <OnboardingStepHeader
        icon={Camera}
        title="Sua foto de perfil"
        lead="Uma imagem ajuda outras mulheres a te reconhecer com carinho. Você pode pular e adicionar depois."
        trustNote="A foto é enviada com segurança depois que sua conta for criada."
      />

      <input
        ref={inputRef}
        type="file"
        accept={PROFILE_IMAGE_ACCEPT_ATTR}
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden
      />

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-[border-color,background-color,transform] duration-300 ease-out",
          dragOver
            ? "border-[var(--auth-button)] bg-[var(--auth-button)]/12 scale-[1.01] shadow-md"
            : "border-black/20 bg-[var(--auth-panel-beige)]",
          "p-6 sm:p-9 flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[240px]"
        )}
      >
        {preview ? (
          <div className="relative w-full max-w-[220px]">
            <img
              src={preview}
              alt="Pré-visualização da foto de perfil"
              className="mx-auto size-40 sm:size-44 rounded-full object-cover border-4 border-black/10 shadow-lg ring-1 ring-black/10"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute -right-0.5 -top-0.5 flex size-10 min-h-10 min-w-10 items-center justify-center rounded-full bg-[var(--woody-ink)] border-2 border-black/10 text-white shadow-md hover:bg-black/80 active:scale-95 transition-[colors,transform] duration-200"
              aria-label="Remover foto"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[var(--auth-button)]/12 ring-1 ring-[var(--auth-button)]/25">
              <ImagePlus className="size-7 text-[var(--auth-text-on-maroon)]/85" aria-hidden />
            </div>
            <p className="text-sm font-medium text-[var(--auth-text-on-maroon)] px-2">
              Arraste uma imagem ou escolha do dispositivo
            </p>
            <p className="mt-1.5 text-xs text-[var(--auth-text-on-maroon)]/65">JPG, PNG ou WebP · até 5 MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(onboardingStyles.secondaryBtn, "mt-6 inline-flex items-center justify-center gap-2")}
            >
              <Camera className="size-4 shrink-0" aria-hidden />
              Selecionar foto
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <div className={cn(onboardingStyles.footerRow, "mt-8 gap-3")}>
        <button type="button" onClick={skip} className={cn(onboardingStyles.secondaryBtn, "sm:flex-1")}>
          Pular por agora
        </button>
        <button
          type="button"
          onClick={continueWithPhoto}
          className={cn(onboardingStyles.primaryBtn, "sm:flex-1")}
          disabled={!preview}
        >
          Continuar
        </button>
      </div>

      <ImageCropDialog
        open={cropOpen}
        onOpenChange={(next) => {
          if (!next) dismissCropSession();
          else setCropOpen(true);
        }}
        imageSrc={cropSrc}
        title="Ajustar foto"
        description="Escolha o enquadramento que aparecerá no seu perfil."
        cropShape="round"
        aspect={1}
        layout="square"
        outputSize={512}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
