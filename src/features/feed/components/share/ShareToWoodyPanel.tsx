import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { useSearch } from "@/features/search/hooks/useSearch";
import { fetchMyConversations } from "@/features/messages/services/messages.service";
import type { ConversationResponseDto } from "@/features/messages/types";
import { DM_MESSAGE_BODY_MAX_LENGTH } from "@/features/messages/lib/dmLimits";

export type ShareToWoodyTarget =
  | { kind: "user"; recipientUserId: number; label: string }
  | { kind: "conversation"; conversationId: number; recipientUserId: number; label: string };

export interface ShareToWoodyPanelProps {
  onSend: (target: ShareToWoodyTarget, message: string) => void;
  isSending: boolean;
  onBack: () => void;
}

function peerLabel(peer: { displayName: string | null; username: string }): string {
  return peer.displayName?.trim() || peer.username;
}

export function ShareToWoodyPanel({ onSend, isSending, onBack }: ShareToWoodyPanelProps) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<ShareToWoodyTarget | null>(null);
  const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const { isLoading, people } = useSearch({ query, mode: "people" });

  useEffect(() => {
    let cancelled = false;
    void fetchMyConversations()
      .then((list) => {
        if (!cancelled) setConversations(list);
      })
      .catch(() => {
        if (!cancelled) setConversations([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingConversations(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const conversationRows = useMemo(
    () =>
      conversations.map((c) => ({
        key: `conv-${c.id}`,
        target: {
          kind: "conversation" as const,
          conversationId: c.id,
          recipientUserId: c.otherUser.id,
          label: peerLabel(c.otherUser),
        },
        avatar: c.otherUser.profilePic,
        subtitle: `@${c.otherUser.username}`,
      })),
    [conversations]
  );

  const peopleRows = useMemo(
    () =>
      people.map((p) => ({
        key: `user-${p.id}`,
        target: {
          kind: "user" as const,
          recipientUserId: Number.parseInt(p.id, 10),
          label: p.name || p.username,
        },
        avatar: p.avatarUrl,
        subtitle: p.username ? `@${p.username}` : undefined,
      })),
    [people]
  );

  const showPeople = query.trim().length > 0;
  const rows = showPeople ? peopleRows : conversationRows;

  const handleSend = () => {
    if (!selected || isSending) return;
    onSend(selected, message.trim());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onBack} disabled={isSending}>
          Voltar
        </Button>
        <p className="text-sm font-medium text-[var(--woody-text)]">Enviar dentro da Woody</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--woody-muted)]" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pessoas…"
          className={cn(
            "h-10 w-full rounded-xl border border-black/10 bg-white/60 pl-9 pr-3 text-sm",
            "text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
          )}
        />
      </div>

      <div className="max-h-52 overflow-y-auto rounded-xl border border-[var(--woody-divider)]">
        {loadingConversations && !showPeople ? (
          <p className="px-3 py-4 text-sm text-[var(--woody-muted)]">Carregando conversas…</p>
        ) : null}
        {!loadingConversations && rows.length === 0 ? (
          <p className="px-3 py-4 text-sm text-[var(--woody-muted)]">
            {showPeople ? "Nenhuma pessoa encontrada." : "Você não possui conversas ativas."}
          </p>
        ) : null}
        <ul className="divide-y divide-[var(--woody-divider)]">
          {rows.map((row) => {
            const isSelected =
              selected != null &&
              selected.kind === row.target.kind &&
              (row.target.kind === "conversation"
                ? selected.kind === "conversation" && selected.conversationId === row.target.conversationId
                : selected.kind === "user" && selected.recipientUserId === row.target.recipientUserId);
            return (
              <li key={row.key}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    isSelected ? "bg-[var(--woody-nav)]/10" : "hover:bg-[var(--woody-nav)]/5"
                  )}
                  onClick={() => setSelected(row.target)}
                  disabled={isSending}
                >
                  <Avatar size="sm">
                    {row.avatar ? <AvatarImage src={resolvePublicMediaUrl(row.avatar)} alt="" /> : null}
                    <AvatarFallback className="text-[0.65rem] font-semibold">
                      {row.target.label.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--woody-text)]">
                      {row.target.label}
                    </span>
                    {row.subtitle ? (
                      <span className="block truncate text-xs text-[var(--woody-muted)]">{row.subtitle}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {isLoading && showPeople ? (
          <div className="flex justify-center py-2">
            <Loader2 className="size-4 animate-spin text-[var(--woody-muted)]" aria-label="Buscando" />
          </div>
        ) : null}
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensagem opcional…"
        maxLength={DM_MESSAGE_BODY_MAX_LENGTH}
        rows={2}
        disabled={isSending}
        className="min-h-[72px] resize-none text-sm"
      />

      <Button
        type="button"
        className="bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90"
        disabled={!selected || isSending}
        onClick={handleSend}
      >
        {isSending ? "Enviando…" : "Enviar"}
      </Button>
    </div>
  );
}
