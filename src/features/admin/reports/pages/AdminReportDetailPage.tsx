import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Flag,
  User,
  Calendar,
  MessageSquare,
  FileText,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { ReportStatusBadge } from "../components/ReportStatusBadge";
import {
  getAdminReportDetail,
  updateAdminReportStatus,
  type AdminReportDetail,
  type ReportStatus,
} from "../services/adminReports.service";
import { resolvePublicMediaUrl } from "@/lib/api";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatDateLong,
  getUserInitials,
  targetTypeLabel,
  reasonLabel,
} from "../utils/reportHelpers";

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "Pending", label: "Pendente" },
  { value: "InReview", label: "Em análise" },
  { value: "Resolved", label: "Resolvida" },
  { value: "Rejected", label: "Improcedente" },
];

export function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);

  const [detail, setDetail] = useState<AdminReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("Pending");
  const [internalNote, setInternalNote] = useState("");
  const [resolutionCode, setResolutionCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!reportId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminReportDetail(reportId);
      setDetail(data);
      setSelectedStatus(data.status);
      setInternalNote(data.internalNote ?? "");
      setResolutionCode(data.resolutionCode ?? "");
    } catch {
      setError("Não foi possível carregar os detalhes. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = useCallback(async () => {
    if (!reportId) return;
    setIsSaving(true);
    try {
      // Sempre envia os campos (mesmo vazios) para que o backend possa limpar valores existentes.
      // O backend interpreta string vazia como "limpar o campo", null/ausente como "não alterar".
      const updated = await updateAdminReportStatus(reportId, {
        status: selectedStatus,
        internalNote: internalNote.trim(),
        resolutionCode: resolutionCode.trim() || undefined,
      });
      setDetail(updated);
      setSelectedStatus(updated.status);
      setInternalNote(updated.internalNote ?? "");
      setResolutionCode(updated.resolutionCode ?? "");
      showSuccessToast("Denúncia atualizada.", { id: "report-save-success" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível salvar. Tente novamente.";
      showErrorToast(msg, { id: "report-save-error" });
    } finally {
      setIsSaving(false);
    }
  }, [reportId, selectedStatus, internalNote, resolutionCode]);

  if (isLoading) {
    return (
      <FeedLayout showRightPanel={false} wideMain>
        <AdminNav />
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
        <AdminNav />
        <div className="flex flex-col items-center gap-3 py-16 text-sm text-zinc-400">
          <AlertCircle className="size-8 text-red-400" aria-hidden />
          <p>{error ?? "Denúncia não encontrada."}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Tentar novamente
            </button>
            <Link
              to="/admin/reports"
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Voltar à lista
            </Link>
          </div>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout showRightPanel={false} wideMain>
      <AdminNav />

      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2">
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Denúncias
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-sm text-zinc-600 font-medium">
          #{detail.id} — {targetTypeLabel(detail.targetType)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_340px]">
        {/* Coluna principal */}
        <div className="space-y-4">
          {/* Dados da denúncia */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-600">Dados da denúncia</h2>
              <ReportStatusBadge status={detail.status} />
            </div>
            <div className="p-5 space-y-0">
              <InfoRow
                icon={<Flag className="size-4" />}
                label="Tipo"
                value={targetTypeLabel(detail.targetType)}
              />
              <InfoRow
                icon={<FileText className="size-4" />}
                label="Motivo"
                value={reasonLabel(detail.reasonCode)}
              />
              <InfoRow
                icon={<Calendar className="size-4" />}
                label="Data da denúncia"
                value={formatDateLong(detail.createdAt)}
              />
              {detail.details && (
                <div className="flex items-start gap-2.5 py-2.5 border-b border-black/6">
                  <span className="mt-0.5 text-zinc-400 shrink-0">
                    <MessageSquare className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">Detalhe enviado</p>
                    <p className="text-sm text-[var(--woody-ink)] leading-relaxed break-words">
                      {detail.details}
                    </p>
                  </div>
                </div>
              )}
              {detail.sameTargetReportCount > 1 && (
                <div className="pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200/80">
                    <Flag className="size-3" aria-hidden />
                    {detail.sameTargetReportCount} denúncias neste mesmo conteúdo
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Partes */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-600">Partes envolvidas</h2>
            </div>
            <div className="divide-y divide-black/6">
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                  Denunciante
                </p>
                <UserCard user={detail.reporterUser} />
              </div>
              {detail.reportedContentAuthor && (
                <div className="px-5 py-4">
                  <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                    Autora do conteúdo
                  </p>
                  <UserCard user={detail.reportedContentAuthor} />
                </div>
              )}
              {detail.reviewedBy && (
                <div className="px-5 py-4">
                  <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                    Revisada por
                  </p>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-zinc-400" aria-hidden />
                    <span className="text-sm text-[var(--woody-ink)]">
                      {detail.reviewedBy.displayName ?? detail.reviewedBy.username}
                    </span>
                    <span className="text-xs text-zinc-400">@{detail.reviewedBy.username}</span>
                  </div>
                  {detail.reviewedAt && (
                    <p className="mt-1 text-xs text-zinc-400">
                      em {formatDateLong(detail.reviewedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo denunciado */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-600">Conteúdo denunciado</h2>
            </div>
            <div className="p-5">
              {detail.targetType === "post" && detail.post ? (
                <PostContentCard post={detail.post} />
              ) : detail.targetType === "comment" && detail.comment ? (
                <CommentContentCard comment={detail.comment} />
              ) : (
                <p className="text-sm text-zinc-400 italic">
                  Conteúdo indisponível ou removido.
                </p>
              )}
            </div>
          </div>

          {/* Nota interna atual */}
          {detail.internalNote && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
                Nota interna
              </p>
              <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                {detail.internalNote}
              </p>
            </div>
          )}
        </div>

        {/* Coluna de decisão */}
        <div className="space-y-4">
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden sticky top-[calc(var(--app-topnav-height)+1rem)]">
            <div className="px-5 py-4 border-b border-black/8 bg-zinc-50/50">
              <h2 className="text-sm font-semibold text-zinc-600">Decisão</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                  className="w-full appearance-none rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--woody-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nota interna */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Nota interna
                </label>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={4}
                  placeholder="Registre observações internas sobre esta denúncia…"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--woody-ink)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35 resize-none"
                />
                <p className="text-xs text-zinc-400">
                  Esta nota é interna e não será exibida para as usuárias.
                </p>
              </div>

              {/* Código de resolução */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Código de resolução{" "}
                  <span className="font-normal normal-case text-zinc-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={resolutionCode}
                  onChange={(e) => setResolutionCode(e.target.value)}
                  placeholder="ex: removed_content"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-[var(--woody-ink)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--auth-button)]/35"
                />
              </div>

              {/* Botão salvar */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-full h-11 rounded-xl font-semibold text-sm",
                  "inline-flex items-center justify-center gap-2",
                  "bg-[var(--auth-button)] text-white",
                  "hover:bg-[var(--auth-button-hover)]",
                  "transition-colors focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50",
                  "disabled:opacity-50"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Salvando…
                  </>
                ) : (
                  "Salvar decisão"
                )}
              </button>

              <Link
                to="/admin/reports"
                className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-black/12 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Voltar à lista
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FeedLayout>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

function UserCard({
  user,
}: {
  user: { id: string; name: string; username: string; avatarUrl?: string | null };
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        {user.avatarUrl && (
          <AvatarImage src={resolvePublicMediaUrl(user.avatarUrl)} alt={user.username} />
        )}
        <AvatarFallback className="text-xs bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
          {getUserInitials(user.name, user.username)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-[var(--woody-ink)] text-sm">{user.name}</p>
        <p className="text-xs text-zinc-400">@{user.username}</p>
      </div>
    </div>
  );
}

function PostContentCard({
  post,
}: {
  post: {
    id: number;
    publicId: string;
    content: string;
    isDeleted: boolean;
    createdAt: string;
    media: { kind: string; url: string }[];
  };
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-400">
          Post #{post.id} · {formatDate(post.createdAt)}
        </p>
        {post.isDeleted && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-red-200/80">
            Removido
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--woody-ink)] leading-relaxed whitespace-pre-wrap break-words">
        {post.content || <span className="text-zinc-400 italic">Sem conteúdo textual.</span>}
      </p>

      {post.media.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {post.media.map((m, i) => (
            <MediaThumb key={i} kind={m.kind} url={m.url} />
          ))}
        </div>
      )}

      <a
        href={`/posts/${post.publicId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-[var(--auth-button-hover)] hover:underline"
      >
        Abrir post
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}

function CommentContentCard({
  comment,
}: {
  comment: {
    id: number;
    content: string;
    isDeleted: boolean;
    createdAt: string;
    parentPost?: {
      id: number;
      publicId: string;
      content: string;
      isDeleted: boolean;
      createdAt: string;
      media: { kind: string; url: string }[];
    } | null;
  };
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-400">
          Comentário #{comment.id} · {formatDate(comment.createdAt)}
        </p>
        {comment.isDeleted && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-red-200/80">
            Removido
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--woody-ink)] leading-relaxed whitespace-pre-wrap break-words">
        {comment.content || <span className="text-zinc-400 italic">Sem conteúdo textual.</span>}
      </p>

      {comment.parentPost && (
        <div className="mt-2 rounded-lg border border-black/8 bg-zinc-50 p-3">
          <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Post relacionado
          </p>
          <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
            {comment.parentPost.content}
          </p>
          <a
            href={`/posts/${comment.parentPost.publicId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--auth-button-hover)] hover:underline"
          >
            Abrir post
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      )}
    </div>
  );
}

function MediaThumb({ kind, url }: { kind: string; url: string }) {
  if (kind === "image" || kind === "gif") {
    return (
      <a href={resolvePublicMediaUrl(url)} target="_blank" rel="noopener noreferrer">
        <img
          src={resolvePublicMediaUrl(url)}
          alt="Mídia da denúncia"
          className="h-20 w-20 rounded-lg object-cover border border-black/10 hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-black/10 bg-zinc-100">
      <ImageIcon className="size-6 text-zinc-400" aria-hidden />
    </div>
  );
}
