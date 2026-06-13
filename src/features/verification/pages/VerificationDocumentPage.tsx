import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Upload, X, Loader2, CheckCircle2, FileImage } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  submitVerificationDocument,
} from "../services/verification.service";
import { showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function VerificationDocumentPage() {
  const navigate = useNavigate();
  const { logout, patchUser } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;

    if (!["image/jpeg", "image/png"].includes(selected.type)) {
      setError("Apenas imagens JPG ou PNG são aceitas.");
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError("O arquivo deve ter no máximo 8 MB.");
      return;
    }
    setError(null);
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  const handleSubmit = useCallback(async () => {
    if (!file || !consentChecked) return;
    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      await submitVerificationDocument(file, consentChecked, setUploadProgress);
      patchUser({ verificationStatus: "PendingReview" });
      setSuccess(true);
      setTimeout(() => navigate("/verification/pending", { replace: true }), 1200);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível enviar o documento. Tente novamente.";
      setError(msg);
      showErrorToast(msg, { id: "verification-upload-error" });
    } finally {
      setIsSubmitting(false);
    }
  }, [file, consentChecked, navigate, patchUser]);

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto mt-4 md:mt-0">
        <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-[var(--auth-button)]/8 border-b border-black/8 px-6 py-5 flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
              <Shield className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--woody-ink)] leading-snug">
                Verificação de identidade
              </h1>
              <p className="mt-0.5 text-sm text-[var(--woody-muted)]">
                Precisamos confirmar quem você é antes de liberar o acesso.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Explicação */}
            <div className="rounded-xl bg-[var(--woody-sand)] px-4 py-3.5 text-sm text-[var(--woody-ink)]/80 leading-relaxed space-y-1.5">
              <p>
                Você gostaria de estar em uma rede social sáfica onde homens pudessem entrar? Nós também não. Por isso, realizamos uma verificação em duas etapas, quando necessário. Na primeira etapa, pedimos que você envie uma selfie clara do seu rosto. Caso haja necessidade de validação adicional, poderemos solicitar um documento de identificação.
              </p>
              <p>
                Esse processo é fundamental para proteger nossa comunidade e garantir que este continue sendo um espaço seguro e exclusivamente nosso.
              </p>
              <p className="text-[var(--woody-muted)]">
                Fique tranquila(e): após a análise,{" "}
                <strong className="font-medium text-[var(--woody-ink)]/70">suas fotos e documentos são excluídos do nosso banco de dados</strong> automaticamente.
              </p>
            </div>

            {/* Upload d*/}
            {!preview ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "w-full rounded-xl border-2 border-dashed border-black/15 bg-[var(--woody-sand)]/50",
                  "px-4 py-8 flex flex-col items-center gap-2 text-sm text-[var(--woody-muted)]",
                  "hover:border-[var(--auth-button)]/50 hover:bg-[var(--auth-button)]/5",
                  "transition-colors duration-150 cursor-pointer focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/40"
                )}
                aria-label="Selecionar foto"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--auth-button)]/12 text-[var(--auth-button-hover)]">
                  <FileImage className="size-5" aria-hidden />
                </div>
                <span className="font-medium text-[var(--woody-ink)]/70">
                  Selecionar foto
                </span>
                <span className="text-xs">JPG ou PNG · máx. 8 MB</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-black/10 bg-[var(--woody-sand)]">
                <img
                  src={preview}
                  alt="Pré-visualização da foto"
                  className="w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                  className={cn(
                    "absolute top-2 right-2 flex size-7 items-center justify-center",
                    "rounded-full bg-white/90 shadow-sm border border-black/10",
                    "text-[var(--woody-muted)] hover:text-[var(--woody-ink)]",
                    "transition-colors duration-150 disabled:opacity-50"
                  )}
                  aria-label="Remover imagem"
                >
                  <X className="size-4" />
                </button>
                <div className="px-3 py-2 bg-white/80 border-t border-black/8 flex items-center gap-1.5 text-xs text-[var(--woody-muted)]">
                  <Upload className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{file?.name}</span>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Arquivo da foto"
            />

            {/* Consentimento */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={cn(
                    "size-5 rounded-md border-2 flex items-center justify-center",
                    "transition-colors duration-150",
                    consentChecked
                      ? "bg-[var(--auth-button)] border-[var(--auth-button)]"
                      : "border-black/25 bg-white group-hover:border-[var(--auth-button)]/60"
                  )}
                >
                  {consentChecked && (
                    <svg
                      className="size-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-[var(--woody-ink)]/80 leading-snug select-none">
                Estou ciente de que a foto será usada{" "}
                <strong className="font-semibold">apenas para verificação de acesso</strong> à
                Woody e será descartada após a decisão.
              </span>
            </label>

            {/* Erro */}
            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Progresso */}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--woody-muted)]">
                  <span>Enviando documento…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--auth-button)] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sucesso */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Documento enviado! Redirecionando…
              </div>
            )}

            {/* Botão */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || !consentChecked || isSubmitting || success}
              className={cn(
                "w-full h-11 rounded-xl font-semibold text-sm",
                "inline-flex items-center justify-center gap-2",
                "bg-[var(--auth-button)] text-white",
                "hover:bg-[var(--auth-button-hover)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Enviando…
                </>
              ) : (
                <>
                  <Upload className="size-4" aria-hidden />
                  Enviar para revisão
                </>
              )}
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={logout}
            className="text-sm text-[var(--woody-muted)] hover:text-[var(--woody-ink)] underline-offset-2 hover:underline transition-colors duration-150"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
