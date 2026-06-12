import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VerificationStatusBadge } from "../components/VerificationStatusBadge";
import { DocumentViewer } from "../components/DocumentViewer";
import { RejectionReasonModal } from "../components/RejectionReasonModal";
import {
  getVerificationRequest,
  approveVerification,
  rejectVerification,
  type AdminVerificationDetailDto,
} from "../services/adminVerification.service";
import { resolvePublicMediaUrl } from "@/lib/api";
import {
  showSuccessToast,
  showErrorToast,
} from "@/lib/toast";
import { cn } from "@/lib/utils";

function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUserInitials(name: string | null | undefined, username: string): string {
  const display = name?.trim() || username;
  const parts = display.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return display.slice(0, 2).toUpperCase();
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-black/6 last:border-0">
      <span className="mt-0.5 text-zinc-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm text-[var(--woody-ink)] break-all">{value}</p>
      </div>
    </div>
  );
}

export function AdminVerificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const verificationId = Number(id);

  const [detail, setDetail] = useState<AdminVerificationDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [showDecisionLog, setShowDecisionLog] = useState(false);

  const load = useCallback(async () => {
    if (!verificationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVerificationRequest(verificationId);
      setDetail(data);
    } catch {
      setError("Não foi possível carregar os detalhes. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [verificationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = useCallback(async () => {
    if (!verificationId) return;
    setIsApproving(true);
    try {
      const updated = await approveVerification(verificationId);
      setDetail(updated);
      setShowApproveDialog(false);
      showSuccessToast(`@${updated.username} aprovada com sucesso.`, {
        id: "admin-approve-success",
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível aprovar. Tente novamente.";
      showErrorToast(msg, { id: "admin-approve-error" });
    } finally {
      setIsApproving(false);
    }
  }, [verificationId]);

  const handleReject = useCallback(
    async (reason: string) => {
      if (!verificationId) return;
      const updated = await rejectVerification(verificationId, reason);
      setDetail(updated);
      setShowRejectModal(false);
      showSuccessToast(`Solicitação de @${updated.username} recusada.`, {
        id: "admin-reject-success",
      });
    },
    [verificationId]
  );

  if (isLoading) {
    return (
      <FeedLayout showRightPanel={false} wideMain>
        <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-400">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Carregando…
        </div>
      </FeedLayout>
    );
  }

  if (error || !detail) {
    return (
      <FeedLayout showRightPanel={false} wideMain>
        <div className="flex flex-col items-center gap-3 py-16 text-sm text-zinc-400">
          <AlertCircle className="size-8 text-red-400" aria-hidden />
          <p>{error ?? "Solicitação não encontrada."}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Tentar novamente
            </button>
            <Link
              to="/admin/verification"
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Voltar à lista
            </Link>
          </div>
        </div>
      </FeedLayout>
    );
  }

  const isAlreadyDecided = detail.status === "Approved" || detail.status === "Rejected";
  const canAct = detail.status === "PendingReview";
  const canApproveWithoutDocs = detail.status === "PendingDocument";

  return (
    <FeedLayout showRightPanel={false} wideMain>
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2">
        <Link
          to="/admin/verification"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Verificações
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-sm text-zinc-600 font-medium">
          #{detail.verificationId} — @{detail.username}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_340px]">
        {/* Coluna principal */}
        <div className="space-y-4">
          {/* Card do utilizador */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-600">Dados da utilizadora</h2>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <Avatar size="lg">
                  {detail.avatarUrl && (
                    <AvatarImage
                      src={resolvePublicMediaUrl(detail.avatarUrl)}
                      alt={detail.username}
                    />
                  )}
                  <AvatarFallback className="text-sm bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
                    {getUserInitials(detail.displayName, detail.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[var(--woody-ink)]">
                    {detail.displayName ?? detail.username}
                  </p>
                  <p className="text-sm text-zinc-400">@{detail.username}</p>
                  <div className="mt-1.5">
                    <VerificationStatusBadge status={detail.status} />
                  </div>
                </div>
              </div>
              <div className="space-y-0">
                <InfoRow
                  icon={<Mail className="size-4" />}
                  label="Email"
                  value={detail.email}
                />
                <InfoRow
                  icon={<Hash className="size-4" />}
                  label="ID de verificação"
                  value={`#${detail.verificationId}`}
                />
                <InfoRow
                  icon={<Calendar className="size-4" />}
                  label="Documento enviado em"
                  value={formatDateLong(detail.documentSubmittedAt)}
                />
                {detail.consentGivenAt && (
                  <InfoRow
                    icon={<CheckCircle2 className="size-4" />}
                    label="Consentimento dado em"
                    value={formatDateLong(detail.consentGivenAt)}
                  />
                )}
                {detail.attemptCount > 1 && (
                  <InfoRow
                    icon={<User className="size-4" />}
                    label="Tentativas"
                    value={String(detail.attemptCount)}
                  />
                )}
                {detail.reviewedAt && (
                  <InfoRow
                    icon={<Calendar className="size-4" />}
                    label="Revisado em"
                    value={formatDateLong(detail.reviewedAt)}
                  />
                )}
                {detail.rejectionReason && (
                  <div className="py-2.5 border-b border-black/6">
                    <p className="text-xs text-zinc-400 mb-1">Motivo da recusa</p>
                    <p className="text-sm text-red-600 leading-relaxed">{detail.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-600">Fotos de verificação</h2>
            </div>
            <div className="p-5">
              <DocumentViewer
                verificationId={detail.verificationId}
                documentCount={detail.documentUrls.length}
              />
            </div>
          </div>

          {/* Log de decisões */}
          {detail.decisionLog && (
            <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDecisionLog((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-50/70 transition-colors"
              >
                Histórico de decisões
                {showDecisionLog ? (
                  <ChevronUp className="size-4 text-zinc-400" aria-hidden />
                ) : (
                  <ChevronDown className="size-4 text-zinc-400" aria-hidden />
                )}
              </button>
              {showDecisionLog && (
                <div className="px-5 pb-4">
                  <pre className="text-xs text-zinc-500 bg-zinc-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
                    {detail.decisionLog}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna de ações */}
        <div className="space-y-4">
          {/* Painel de ações */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden sticky top-[calc(var(--app-topnav-height)+1rem)]">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-600">Ações</h2>
            </div>
            <div className="p-5 space-y-3">
              {isAlreadyDecided ? (
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2",
                    detail.status === "Approved"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {detail.status === "Approved" ? (
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <XCircle className="size-4 shrink-0" aria-hidden />
                  )}
                  {detail.status === "Approved" ? "Conta aprovada" : "Conta recusada"}
                </div>
              ) : canApproveWithoutDocs ? (
                <>
                  <p className="text-xs text-zinc-400 text-center pb-1">
                    Aguardando envio das fotos pela utilizadora.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowApproveDialog(true)}
                    className={cn(
                      "w-full h-11 rounded-xl font-semibold text-sm",
                      "inline-flex items-center justify-center gap-2",
                      "border border-amber-300 bg-amber-50 text-amber-700",
                      "hover:bg-amber-100 hover:border-amber-400",
                      "transition-colors focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-amber-400/40"
                    )}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Aprovar mesmo sem fotos
                  </button>
                </>
              ) : !canAct ? (
                <p className="text-sm text-zinc-400 text-center py-2">
                  Nenhuma ação disponível.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowApproveDialog(true)}
                    className={cn(
                      "w-full h-11 rounded-xl font-semibold text-sm",
                      "inline-flex items-center justify-center gap-2",
                      "bg-[var(--auth-button)] text-white",
                      "hover:bg-[var(--auth-button-hover)]",
                      "transition-colors focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
                    )}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Aprovar conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className={cn(
                      "w-full h-11 rounded-xl font-semibold text-sm",
                      "inline-flex items-center justify-center gap-2",
                      "border border-red-200 bg-red-50 text-red-600",
                      "hover:bg-red-100 hover:border-red-300",
                      "transition-colors focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-red-400/40"
                    )}
                  >
                    <XCircle className="size-4" aria-hidden />
                    Recusar
                  </button>
                </>
              )}

              <Link
                to="/admin/verification"
                className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-black/12 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Voltar à lista
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de aprovação */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="size-5" aria-hidden />
              Confirmar aprovação
            </DialogTitle>
            <DialogDescription>
              A conta de{" "}
              <strong className="font-semibold text-[var(--woody-ink)]">
                @{detail.username}
              </strong>{" "}
              será aprovada e ela terá acesso imediato à plataforma.
              {canApproveWithoutDocs && (
                <>
                  {" "}
                  <strong className="font-semibold text-amber-700">
                    Atenção: esta utilizadora ainda não enviou as fotos de verificação.
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowApproveDialog(false)}
              disabled={isApproving}
              className="h-10 rounded-xl border border-black/15 px-4 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold",
                "bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)]",
                "disabled:opacity-50 transition-colors"
              )}
            >
              {isApproving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Aprovando…
                </>
              ) : (
                "Sim, aprovar"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de recusa */}
      <RejectionReasonModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={handleReject}
        username={detail.username}
      />
    </FeedLayout>
  );
}
