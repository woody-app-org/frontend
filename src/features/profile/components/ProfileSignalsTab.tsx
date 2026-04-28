import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Heart, Loader2, MessageCircle, Sparkles, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import { startOrGetConversation } from "@/features/messages/services/messages.service";
import {
  archiveProfileSignal,
  fetchReceivedProfileSignals,
  type ProfileSignal,
} from "../services/profile-signals.service";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatSignalDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileSignalsTab() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<ProfileSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySignalId, setBusySignalId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchReceivedProfileSignals(1, 30);
      setSignals(page.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar os sinais.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const archive = async (signalId: number) => {
    setBusySignalId(signalId);
    setError(null);
    try {
      await archiveProfileSignal(signalId);
      setSignals((prev) => prev.filter((signal) => signal.id !== signalId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível arquivar o sinal.");
    } finally {
      setBusySignalId(null);
    }
  };

  const startConversation = async (senderId: string) => {
    const userId = Number.parseInt(senderId, 10);
    if (!Number.isFinite(userId) || userId < 1) return;
    setBusySignalId(userId);
    setError(null);
    try {
      const conversation = await startOrGetConversation(userId);
      navigate(`/messages/${conversation.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir a conversa.");
    } finally {
      setBusySignalId(null);
    }
  };

  if (loading) {
    return (
      <div className={cn(woodySurface.card, "flex flex-col items-center justify-center gap-3 px-5 py-12 text-[var(--woody-muted)]")} role="status">
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
              Flertes enviados para ti aparecem só aqui. Arquivar remove o cartão desta lista sem expor nada no teu perfil público.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      {signals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--woody-divider)] bg-[var(--woody-card)]/82 px-5 py-10 text-center shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-[var(--woody-tag-bg)] text-[var(--woody-nav)]">
            <Heart className="size-5" aria-hidden />
          </div>
          <h3 className="text-sm font-semibold text-[var(--woody-text)]">Nenhum sinal por enquanto</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-[var(--woody-muted)]">
            Quando alguém demonstrar interesse pelo teu perfil, o sinal aparece nesta área privada.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {signals.map((signal) => {
            const senderId = signal.sender.id;
            const busy = busySignalId === signal.id || busySignalId === Number.parseInt(senderId, 10);
            return (
              <article key={signal.id} className={cn(woodySurface.card, "p-4 sm:p-5")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={signal.sender.avatarUrl ?? undefined} alt={signal.sender.name} />
                      <AvatarFallback className="bg-[var(--woody-nav)]/10 font-semibold text-[var(--woody-text)]">
                        {initials(signal.sender.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--woody-text)]">{signal.sender.name}</h3>
                        <span className="rounded-full bg-[var(--woody-tag-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--woody-tag-text)]">
                          {signal.label} {signal.emoji}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--woody-muted)]">
                        {signal.sender.username ? `@${signal.sender.username} · ` : ""}
                        {formatSignalDate(signal.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(woodyFocus.ring, "touch-manipulation rounded-lg")}
                      onClick={() => navigate(`/profile/${senderId}`)}
                    >
                      <UserRound className="size-4" aria-hidden />
                      Ver perfil
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      className={cn(woodyFocus.ring, "touch-manipulation rounded-lg")}
                      onClick={() => void startConversation(senderId)}
                    >
                      <MessageCircle className="size-4" aria-hidden />
                      Conversar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      className={cn(woodyFocus.ring, "touch-manipulation rounded-lg text-[var(--woody-muted)] hover:text-[var(--woody-text)]")}
                      onClick={() => void archive(signal.id)}
                    >
                      {busySignalId === signal.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Archive className="size-4" aria-hidden />}
                      Arquivar
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
