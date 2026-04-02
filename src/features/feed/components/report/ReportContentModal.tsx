import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import type { Comment, Post } from "@/domain/types";
import type { ContentReportReasonCode } from "@/domain/contentReport";
import {
  reportCommentMock,
  reportPostMock,
} from "@/domain/services/contentModerationMock.service";
import { postComposerFieldStyles } from "../../lib/postComposerFieldStyles";
import { ReportReasonSelector } from "./ReportReasonSelector";
import { ReportSuccessState } from "./ReportSuccessState";

const DETAILS_MAX = 500;

export type ReportContentTarget =
  | { kind: "post"; post: Post }
  | { kind: "comment"; post: Post; comment: Comment };

function truncatePreview(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export interface ReportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ReportContentTarget;
  viewerId: string;
}

export function ReportContentModal({ open, onOpenChange, target, viewerId }: ReportContentModalProps) {
  const formName = useId();
  const [step, setStep] = useState<"form" | "success">("form");
  const [reason, setReason] = useState<ContentReportReasonCode | null>(null);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetEntityId = target.kind === "post" ? target.post.id : target.comment.id;

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setReason(null);
    setDetails("");
    setError(null);
    setIsSubmitting(false);
  }, [open, target.kind, targetEntityId]);

  const isComment = target.kind === "comment";
  const preview =
    target.kind === "post"
      ? truncatePreview(target.post.title || target.post.content, 160)
      : truncatePreview(target.comment.content, 160);

  const title = isComment ? "Denunciar comentário" : "Denunciar publicação";

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        reasonCode: reason,
        details: details.trim() || undefined,
      };
      const result =
        target.kind === "post"
          ? await reportPostMock(target.post.id, viewerId, payload)
          : await reportCommentMock(target.comment.id, viewerId, payload);

      if (!result.ok) {
        setError(result.message);
        return;
      }
      setStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = reason != null && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "max-h-[min(92vh,720px)] flex flex-col gap-0 border-[var(--woody-accent)]/15 p-0 sm:max-w-lg"
        )}
      >
        {step === "success" ? (
          <ReportSuccessState isComment={isComment} onClose={handleClose} />
        ) : (
          <>
            <DialogHeader className="shrink-0 border-b border-[var(--woody-accent)]/10 px-4 py-4 sm:px-5">
              <DialogTitle className="text-[var(--woody-text)]">{title}</DialogTitle>
              <DialogDescription className="text-pretty">
                Sua denúncia é confidencial. Escolha o motivo que melhor descreve o problema — isso nos ajuda a
                priorizar com sensibilidade.
              </DialogDescription>
            </DialogHeader>

            <form
              id={formName}
              onSubmit={(e) => void handleSubmit(e)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
                {preview ? (
                  <div className="rounded-xl border border-[var(--woody-accent)]/10 bg-[var(--woody-nav)]/5 px-3 py-2.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--woody-muted)]">
                      Conteúdo
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--woody-text)]/90 [overflow-wrap:anywhere]">
                      {preview}
                    </p>
                  </div>
                ) : null}

                <ReportReasonSelector
                  name={`report-reason-${formName}`}
                  value={reason}
                  onChange={setReason}
                  disabled={isSubmitting}
                />

                <div className="space-y-1.5">
                  <label htmlFor={`${formName}-details`} className="text-sm font-medium text-[var(--woody-text)]">
                    Observações <span className="font-normal text-[var(--woody-muted)]">(opcional)</span>
                  </label>
                  <Textarea
                    id={`${formName}-details`}
                    value={details}
                    onChange={(e) => setDetails(e.target.value.slice(0, DETAILS_MAX))}
                    placeholder="Contexto adicional que possa ajudar na análise…"
                    rows={4}
                    disabled={isSubmitting}
                    className={postComposerFieldStyles.textarea}
                    maxLength={DETAILS_MAX}
                  />
                  <p className="text-right text-xs text-[var(--woody-muted)] tabular-nums">
                    {details.length}/{DETAILS_MAX}
                  </p>
                </div>

                {error ? (
                  <p className="text-sm text-[var(--woody-accent)]" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 bg-[var(--woody-card)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(woodyFocus.ring, "w-full sm:w-auto")}
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form={formName}
                  disabled={!canSubmit}
                  className="w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                      Enviando…
                    </>
                  ) : (
                    "Enviar denúncia"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
