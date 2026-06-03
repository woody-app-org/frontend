import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { SupportStatusBadge } from "../components/SupportStatusBadge";
import { SupportTicketThread } from "../components/SupportTicketThread";
import {
  getMySupportTicket,
  replyToSupportTicket,
  getSupportErrorMessage,
  type SupportTicketDetail,
} from "../services/support.service";
import {
  categoryLabel,
  formatSupportDate,
  isTicketClosed,
} from "../lib/supportHelpers";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { showErrorToast } from "@/lib/toast";

export function SupportDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);

  const load = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMySupportTicket(publicId);
      setDetail(data);
    } catch {
      setError("Solicitação não encontrada ou você não tem acesso.");
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReply = async (body: string) => {
    if (!publicId) return;
    setIsReplying(true);
    try {
      const updated = await replyToSupportTicket(publicId, { body });
      setDetail(updated);
    } catch (err) {
      showErrorToast(
        getSupportErrorMessage(err, "Não foi possível enviar sua resposta."),
        { id: "support-reply-error" }
      );
      throw err;
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <FeedLayout showRightPanel={false}>
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8 space-y-6">
        <Link
          to="/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--woody-nav)] hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao suporte
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-[var(--woody-muted)]" aria-label="Carregando" />
          </div>
        ) : error || !detail ? (
          <div
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error ?? "Solicitação não encontrada."}
          </div>
        ) : (
          <>
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--woody-text)]">{detail.title}</h1>
                <SupportStatusBadge status={detail.status} />
              </div>
              <p className="text-sm text-[var(--woody-muted)]">
                {categoryLabel(detail.category)} · Criada em {formatSupportDate(detail.createdAt)}
              </p>
            </header>

            <section
              className={cn(
                woodySurface.card,
                "rounded-2xl border border-[var(--woody-accent)]/12 p-5 space-y-2"
              )}
            >
              <h2 className="text-sm font-semibold text-[var(--woody-text)]">Descrição</h2>
              <p className="text-sm text-[var(--woody-text)] whitespace-pre-wrap leading-relaxed">
                {detail.description}
              </p>
            </section>

            <section
              className={cn(
                woodySurface.card,
                "rounded-2xl border border-[var(--woody-accent)]/12 p-5"
              )}
            >
              <SupportTicketThread
                messages={detail.messages}
                canReply={!isTicketClosed(detail.status)}
                onReply={handleReply}
                isReplying={isReplying}
              />
            </section>
          </>
        )}
      </div>
    </FeedLayout>
  );
}
