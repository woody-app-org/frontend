import { useState, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { useOnboardingDraftContext } from "../OnboardingContext";
import { useOnboardingNavigation } from "../hooks/useOnboardingNavigation";
import { ONBOARDING_MAX_IMAGE_BYTES } from "../constants";
import { onboardingStyles } from "../uiTokens";
import { cn } from "@/lib/utils";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}

/**
 * Etapa 3 — foto de perfil (upload local; futuro: storage + URL assinada).
 */
export function OnboardingStepProfilePhoto() {
  const { draft, updateDraft } = useOnboardingDraftContext();
  const { goNext } = useOnboardingNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const preview = draft.profilePhotoDataUrl ?? null;

  const processFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
        return;
      }
      if (file.size > ONBOARDING_MAX_IMAGE_BYTES) {
        setError("A imagem deve ter no máximo 5 MB.");
        return;
      }
      setIsLoading(true);
      try {
        const url = await readFileAsDataUrl(file);
        updateDraft({ profilePhotoDataUrl: url, skippedProfilePhoto: false });
      } catch {
        setError("Não foi possível carregar a imagem. Tente outro arquivo.");
      } finally {
        setIsLoading(false);
      }
    },
    [updateDraft]
  );

  if (!draft.account) {
    return <Navigate to="/auth/onboarding/1" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    void processFile(f);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    void processFile(f);
  };

  const clearPhoto = () => {
    updateDraft({ profilePhotoDataUrl: null });
    setError(null);
  };

  const skip = () => {
    updateDraft({ skippedProfilePhoto: true, profilePhotoDataUrl: null });
    goNext();
  };

  const continueWithPhoto = () => {
    updateDraft({ skippedProfilePhoto: false });
    goNext();
  };

  return (
    <div>
      <h1 className={onboardingStyles.stepTitle}>Sua foto de perfil</h1>
      <p className={onboardingStyles.stepLead}>
        Uma imagem ajuda outras mulheres a reconhecer você com carinho. Se preferir, pode adicionar depois.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
          "relative rounded-2xl border-2 border-dashed transition-[border-color,background-color,transform] duration-200",
          dragOver
            ? "border-[var(--auth-button)] bg-[var(--auth-button)]/10 scale-[1.01]"
            : "border-white/25 bg-[var(--auth-panel-beige)]/[0.06]",
          "p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[200px]"
        )}
      >
        {isLoading ? (
          <Loader2 className="size-10 animate-spin text-[var(--auth-text-on-maroon)]/70" aria-hidden />
        ) : preview ? (
          <div className="relative w-full max-w-[200px]">
            <img
              src={preview}
              alt="Pré-visualização da foto de perfil"
              className="mx-auto size-40 rounded-full object-cover border-4 border-white/20 shadow-lg"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute -right-1 -top-1 flex size-9 items-center justify-center rounded-full bg-[var(--auth-panel-maroon)] border-2 border-white/30 text-white shadow-md hover:bg-black/30 transition-colors"
              aria-label="Remover foto"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[var(--auth-panel-beige)]/12">
              <ImagePlus className="size-7 text-[var(--auth-text-on-maroon)]/85" aria-hidden />
            </div>
            <p className="text-sm font-medium text-[var(--auth-text-on-maroon)]">
              Arraste uma imagem ou escolha do dispositivo
            </p>
            <p className="mt-1 text-xs text-[var(--auth-text-on-maroon)]/65">JPG, PNG ou WebP · até 5 MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(onboardingStyles.secondaryBtn, "mt-5 inline-flex items-center gap-2")}
            >
              <Camera className="size-4" aria-hidden />
              Selecionar foto
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-200 bg-red-900/30 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <div className={cn(onboardingStyles.footerRow, "mt-8")}>
        <button type="button" onClick={skip} className={onboardingStyles.secondaryBtn}>
          Pular por agora
        </button>
        <button
          type="button"
          onClick={continueWithPhoto}
          className={onboardingStyles.primaryBtn}
          disabled={!preview}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
