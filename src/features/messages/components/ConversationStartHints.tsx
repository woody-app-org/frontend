import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodySection } from "@/lib/woody-ui";
import type { User } from "@/domain/types";
import { fetchMyFollowing } from "@/features/users/services/userSocial.service";
import { StartConversationButton } from "./StartConversationButton";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface ConversationStartHintsProps {
  /** Quando falso, não pede a API (ex.: ainda a carregar listas). */
  enabled: boolean;
}

/** Só monta com `enabled` verdadeiro para evitar `setState` em efeitos só para “limpar” ao desligar. */
export function ConversationStartHints({ enabled }: ConversationStartHintsProps) {
  if (!enabled) return null;
  return <ConversationStartHintsLoaded />;
}

function ConversationStartHintsLoaded() {
  const [following, setFollowing] = useState<User[]>([]);
  const [phase, setPhase] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchMyFollowing(1, 24);
        if (!cancelled) {
          setFollowing(list.slice(0, 10));
          setPhase("done");
        }
      } catch {
        if (!cancelled) {
          setFollowing([]);
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-dashed border-[var(--woody-divider)] bg-[var(--woody-bg)]/70 p-4">
      <h2 className={cn(woodySection.eyebrow, "mb-1 px-0.5")}>Começar a conversar</h2>
      <p className="mb-3 text-sm leading-snug text-[var(--woody-muted)]">
        Abre uma conversa com alguém que segues ou visita o perfil e toca em <strong className="font-medium text-[var(--woody-text)]">Mensagem</strong>.
      </p>

      {phase === "loading" ? (
        <p className="text-sm text-[var(--woody-muted)]">A carregar quem segues…</p>
      ) : phase === "error" ? (
        <p className="text-sm text-[var(--woody-muted)]">Não foi possível carregar sugestões agora.</p>
      ) : following.length === 0 ? (
        <div className="flex items-start gap-2 rounded-xl bg-[var(--woody-card)]/80 px-3 py-3 text-sm text-[var(--woody-muted)]">
          <Users className="mt-0.5 size-4 shrink-0 text-[var(--woody-muted)]" aria-hidden />
          <span>
            Quando seguires alguém, aparece aqui um atalho para enviar mensagem. Até lá, abre um{" "}
            <Link to="/feed" className="font-medium text-[var(--woody-nav)] underline-offset-2 hover:underline">
              perfil no feed
            </Link>{" "}
            e usa o botão <strong className="font-medium text-[var(--woody-text)]">Mensagem</strong>.
          </span>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {following.map((u) => {
            const uid = Number.parseInt(u.id, 10);
            const ok = Number.isFinite(uid) && uid > 0;
            return (
              <li
                key={u.id}
                className="flex items-center gap-2 rounded-xl border border-transparent px-1 py-1.5 transition-colors hover:border-[var(--woody-divider)]/80 hover:bg-[var(--woody-card)]/60"
              >
                <Link
                  to={`/profile/${u.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-0.5 pr-1 text-left"
                  aria-label={`Ver perfil de ${u.name}`}
                >
                  <Avatar className="size-9 shrink-0 border border-[var(--woody-accent)]/12">
                    <AvatarImage src={u.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs font-medium text-[var(--woody-text)]">
                      {initials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium text-[var(--woody-text)]">{u.name}</span>
                </Link>
                {ok ? (
                  <StartConversationButton
                    otherUserId={uid}
                    peerLabel={u.name}
                    variant="outline"
                    compact
                    className="shrink-0"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
