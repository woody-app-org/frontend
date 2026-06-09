import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Lock } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { SupportStatusBadge } from "@/features/support/components/SupportStatusBadge";
import {
  getAdminSupportTicket,
  updateAdminSupportTicket,
  replyAdminSupportTicket,
  getAdminSupportErrorMessage,
  type AdminSupportTicketDetail,
} from "../services/adminSupport.service";
import {
  SUPPORT_STATUS_FILTER_OPTIONS,
  SUPPORT_PRIORITY_OPTIONS,
  categoryLabel,
  formatSupportDate,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/features/support/lib/supportHelpers";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function AdminSupportDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [detail, setDetail] = useState<AdminSupportTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus>("Open");
  const [selectedPriority, setSelectedPriority] = useState<SupportTicketPriority>("Normal");
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const [publicReply, setPublicReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isSendingPublic, setIsSendingPublic] = useState(false);
  const [isSendingInternal, setIsSendingInternal] = useState(false);

  const load = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminSupportTicket(publicId);
      setDetail(data);
      setSelectedStatus(data.status);
      setSelectedPriority(data.priority);
    } catch {
      setError("Não foi possível carregar o ticket.");
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveMeta = async () => {
    if (!publicId) return;
    setIsSavingMeta(true);
    try {
      const updated = await updateAdminSupportTicket(publicId, {
        status: selectedStatus,
        priority: selectedPriority,
      });
      setDetail(updated);
      setSelectedStatus(updated.status);
      setSelectedPriority(updated.priority);
      showSuccessToast("Ticket atualizado.", { id: "admin-support-patch" });
    } catch (err) {
      showErrorToast(
        getAdminSupportErrorMessage(err, "Não foi possível atualizar."),
        { id: "admin-support-patch-error" }
      );
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handlePublicReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicId || !publicReply.trim()) return;
    setIsSendingPublic(true);
    try {
      const updated = await replyAdminSupportTicket(publicId, {
        body: publicReply,
        isInternalNote: false,
      });
      setDetail(updated);
      setPublicReply("");
      showSuccessToast("Resposta enviada.", { id: "admin-support-reply" });
    } catch (err) {
      showErrorToast(
        getAdminSupportErrorMessage(err, "Não foi possível enviar a resposta."),
        { id: "admin-support-reply-error" }
      );
    } finally {
      setIsSendingPublic(false);
    }
  };

  const handleInternalNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicId || !internalNote.trim()) return;
    setIsSendingInternal(true);
    try {
      const updated = await replyAdminSupportTicket(publicId, {
        body: internalNote,
        isInternalNote: true,
      });
      setDetail(updated);
      setInternalNote("");
      showSuccessToast("Nota interna salva.", { id: "admin-support-note" });
    } catch (err) {
      showErrorToast(
        getAdminSupportErrorMessage(err, "Não foi possível salvar a nota."),
        { id: "admin-support-note-error" }
      );
    } finally {
      setIsSendingInternal(false);
    }
  };

  const statusOptions = SUPPORT_STATUS_FILTER_OPTIONS.filter((o) => o.value !== "");

  return (
    <FeedLayout showRightPanel={false} wideMain>
      <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto space-y-5">
        <AdminNav />

        <Link
          to="/admin/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar à lista
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-zinc-400" aria-label="Carregando" />
          </div>
        ) : error || !detail ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="size-4" aria-hidden />
            {error ?? "Ticket não encontrado."}
          </div>
        ) : (
          <>
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900">{detail.title}</h1>
                <SupportStatusBadge status={detail.status} />
                {detail.isBanAppeal ? (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-200">
                    Revisão de banimento
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-zinc-600">
                {categoryLabel(detail.category)} · {formatSupportDate(detail.createdAt)}
              </p>
              <p className="text-sm text-zinc-600">
                Contato informado:{" "}
                <span className="font-medium">
                  {detail.author?.displayName ?? detail.author?.username ?? "—"}
                </span>
                {detail.author?.emailMasked ? (
                  <span className="text-zinc-500"> ({detail.author.emailMasked})</span>
                ) : null}
              </p>
              {detail.isBanAppeal && detail.relatedUserId ? (
                <p className="text-sm text-zinc-600">
                  Conta relacionada (interno): ID {detail.relatedUserId}
                  {detail.author?.username ? (
                    <span className="text-zinc-500"> · @{detail.author.username}</span>
                  ) : null}
                </p>
              ) : detail.isBanAppeal ? (
                <p className="text-sm text-amber-800">
                  Nenhuma conta banida vinculada automaticamente a este e-mail.
                </p>
              ) : null}
            </header>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900">Descrição inicial</h2>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{detail.description}</p>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label htmlFor="admin-status" className="block text-xs font-medium text-zinc-500 mb-1">
                  Status
                </label>
                <select
                  id="admin-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as SupportTicketStatus)}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="admin-priority" className="block text-xs font-medium text-zinc-500 mb-1">
                  Prioridade
                </label>
                <select
                  id="admin-priority"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as SupportTicketPriority)}
                  className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                >
                  {SUPPORT_PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                onClick={() => void handleSaveMeta()}
                disabled={isSavingMeta}
                className="rounded-lg"
              >
                {isSavingMeta ? <Loader2 className="size-4 animate-spin" /> : "Salvar"}
              </Button>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-900">Mensagens</h2>
              {detail.messages.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhuma mensagem ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.messages.map((msg) => (
                    <li
                      key={msg.id}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm",
                        msg.isInternalNote
                          ? "border-amber-200 bg-amber-50/80"
                          : msg.authorRole === "Staff"
                            ? "border-blue-100 bg-blue-50/50"
                            : "border-zinc-100 bg-zinc-50"
                      )}
                    >
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                        {msg.isInternalNote ? (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-800">
                            <Lock className="size-3" aria-hidden />
                            Nota interna
                          </span>
                        ) : (
                          <span className="font-medium">
                            {msg.authorRole === "Staff" ? "Equipe" : "Usuária"}
                          </span>
                        )}
                        <span>·</span>
                        <time dateTime={msg.createdAt}>{formatSupportDate(msg.createdAt)}</time>
                      </div>
                      <p className="whitespace-pre-wrap text-zinc-800">{msg.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900">Resposta pública</h2>
              <p className="text-xs text-zinc-500">Visível para a autora do ticket.</p>
              <form onSubmit={(e) => void handlePublicReply(e)} className="space-y-2">
                <textarea
                  rows={3}
                  value={publicReply}
                  onChange={(e) => setPublicReply(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Resposta da equipe Woody…"
                />
                <Button type="submit" disabled={isSendingPublic || !publicReply.trim()}>
                  {isSendingPublic ? <Loader2 className="size-4 animate-spin" /> : "Enviar resposta"}
                </Button>
              </form>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
              <h2 className="text-sm font-semibold text-amber-950">Nota interna</h2>
              <p className="text-xs text-amber-800/90">Somente SuperAdmin vê esta nota.</p>
              <form onSubmit={(e) => void handleInternalNote(e)} className="space-y-2">
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                  placeholder="Anotações internas…"
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSendingInternal || !internalNote.trim()}
                  className="rounded-lg border-amber-300"
                >
                  {isSendingInternal ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Salvar nota interna"
                  )}
                </Button>
              </form>
            </section>
          </>
        )}
      </div>
    </FeedLayout>
  );
}
