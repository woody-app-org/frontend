import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { SupportTicketForm } from "../components/SupportTicketForm";
import {
  createSupportTicket,
  getSupportErrorMessage,
  type CreateSupportTicketPayload,
} from "../services/support.service";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export function SupportNewPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: CreateSupportTicketPayload) => {
    setIsSubmitting(true);
    try {
      const created = await createSupportTicket(payload);
      showSuccessToast("Solicitação enviada.", { id: "support-created" });
      navigate(`/support/${created.publicId}`, { replace: true });
    } catch (err) {
      showErrorToast(
        getSupportErrorMessage(err, "Não foi possível enviar a solicitação."),
        { id: "support-create-error" }
      );
      throw err;
    } finally {
      setIsSubmitting(false);
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
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-[var(--woody-text)]">Nova solicitação</h1>
          <p className="text-sm text-[var(--woody-muted)]">
            Descreva seu problema com o máximo de detalhes possível.
          </p>
        </header>
        <SupportTicketForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </FeedLayout>
  );
}
