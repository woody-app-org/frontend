import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Post } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { boostCommunityPost, unboostCommunityPost } from "../services/community.service";

function formatBoostEnd(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

const DURATION_OPTIONS = [
  { days: 1, label: "1 dia" },
  { days: 3, label: "3 dias" },
  { days: 7, label: "7 dias" },
  { days: 14, label: "14 dias" },
] as const;

export interface CommunityPostBoostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  post: Post | null;
  onApplied: () => void | Promise<void>;
}

export function CommunityPostBoostDialog({
  open,
  onOpenChange,
  communityId,
  post,
  onApplied,
}: CommunityPostBoostDialogProps) {
  const [durationDays, setDurationDays] = useState<number>(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = Boolean(post?.communityBoostActive);

  const handleClose = (next: boolean) => {
    if (!next) setError(null);
    onOpenChange(next);
  };

  const handleBoost = async () => {
    if (!post) return;
    setBusy(true);
    setError(null);
    try {
      await boostCommunityPost(communityId, post.id, durationDays);
      await onApplied();
      handleClose(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível impulsionar.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnboost = async () => {
    if (!post) return;
    setBusy(true);
    setError(null);
    try {
      await unboostCommunityPost(communityId, post.id);
      await onApplied();
      handleClose(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível cancelar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-[var(--woody-accent)]/18 bg-[var(--woody-card)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--woody-text)]">Impulsionar publicação</DialogTitle>
          <DialogDescription className="text-left text-[var(--woody-muted)]">
            Destaca este post no feed global e na página da comunidade, dentro das regras de visibilidade existentes.
            Usa o plano premium do espaço (e o teu papel de administração), não o Woody Pro da tua conta.
          </DialogDescription>
        </DialogHeader>

        {!post && open ? (
          <p className="text-sm text-[var(--woody-muted)]">Publicação não encontrada na lista actual.</p>
        ) : post ? (
          <div className="space-y-4">
            <p className="rounded-lg border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)] px-3 py-2 text-sm text-[var(--woody-text)]/90">
              <span className="font-medium">{post.title || "Sem título"}</span>
            </p>

            {active ? (
              <p className="text-sm text-[var(--woody-muted)]">
                Impulsionamento activo
                {post.communityBoostEndsAt ? (
                  <>
                    {" "}
                    (até{" "}
                    <span className="font-medium text-[var(--woody-text)]/90">
                      {formatBoostEnd(post.communityBoostEndsAt)}
                    </span>
                    )
                  </>
                ) : null}
                . Podes cancelar ou substituir por um novo período.
              </p>
            ) : null}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--woody-muted)]">
                {active ? "Nova duração (substitui o actual)" : "Duração"}
              </p>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <Button
                    key={opt.days}
                    type="button"
                    size="sm"
                    variant={durationDays === opt.days ? "default" : "outline"}
                    className={cn(woodyFocus.ring, durationDays === opt.days && "bg-[var(--woody-nav)]")}
                    onClick={() => setDurationDays(opt.days)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {error ? (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className={woodyFocus.ring} onClick={() => handleClose(false)}>
            Fechar
          </Button>
          {post && active ? (
            <>
              <Button
                type="button"
                variant="outline"
                className={cn(woodyFocus.ring, "border-red-300/50 text-red-700 dark:text-red-400")}
                disabled={busy}
                onClick={() => void handleUnboost()}
              >
                Cancelar impulsionamento
              </Button>
              <Button
                type="button"
                className={cn(woodyFocus.ring, "bg-[var(--woody-nav)] text-white")}
                disabled={busy}
                onClick={() => void handleBoost()}
              >
                {busy ? "A aplicar…" : "Renovar / substituir"}
              </Button>
            </>
          ) : post ? (
            <Button
              type="button"
              className={cn(woodyFocus.ring, "bg-[var(--woody-nav)] text-white")}
              disabled={busy}
              onClick={() => void handleBoost()}
            >
              {busy ? "A aplicar…" : "Impulsionar"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
