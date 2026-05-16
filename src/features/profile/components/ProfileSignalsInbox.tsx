import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { startOrGetConversation } from "@/features/messages/services/messages.service";
import { useReceivedProfileSignals } from "../hooks/useReceivedProfileSignals";
import type { ProfileSignal } from "../services/profile-signals.service";
import { ProfileSignalReceivedCard } from "./ProfileSignalReceivedCard";
import { ProfileSignalsEmptyState } from "./ProfileSignalsEmptyState";

export function ProfileSignalsInbox() {
  const navigate = useNavigate();
  const { signals, loading, busySignalId, error, markRead, archive } = useReceivedProfileSignals();
  const [actionBusySignalId, setActionBusySignalId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openProfile = async (signal: ProfileSignal) => {
    setActionError(null);
    await markRead(signal.id);
    navigate(`/profile/${signal.sender.id}`);
  };

  const reply = async (signal: ProfileSignal) => {
    const senderId = Number.parseInt(signal.sender.id, 10);
    if (!Number.isFinite(senderId) || senderId < 1) return;

    setActionBusySignalId(signal.id);
    setActionError(null);
    try {
      await markRead(signal.id);
      const conversation = await startOrGetConversation(senderId);
      navigate(`/messages/${conversation.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Não foi possível abrir a conversa.");
    } finally {
      setActionBusySignalId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          woodySurface.card,
          "flex flex-col items-center justify-center gap-3 px-5 py-12 text-[var(--woody-muted)]"
        )}
        role="status"
      >
        <Loader2 className="size-8 animate-spin text-[var(--woody-nav)]" aria-hidden />
        <p className="text-sm">A carregar sinais...</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Sinais recebidos">
      <div className={cn(woodySurface.cardHero, "overflow-hidden p-5 sm:p-6")}>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--woody-tag-bg)] text-[var(--woody-nav)]">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--woody-nav)]/85">Privado</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-[var(--woody-text)]">Sinais recebidos</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)]">
              Flertes enviados para ti aparecem só aqui. Lê, responde ou arquiva sem expor nada no teu perfil público.
            </p>
          </div>
        </div>
      </div>

      {error || actionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error ?? actionError}
        </div>
      ) : null}

      {signals.length === 0 ? (
        <ProfileSignalsEmptyState />
      ) : (
        <div className="grid gap-3">
          {signals.map((signal) => (
            <ProfileSignalReceivedCard
              key={signal.id}
              signal={signal}
              busy={busySignalId === signal.id || actionBusySignalId === signal.id}
              onViewProfile={(next) => void openProfile(next)}
              onReply={(next) => void reply(next)}
              onArchive={(next) => void archive(next.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
