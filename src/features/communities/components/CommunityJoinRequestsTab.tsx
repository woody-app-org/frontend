import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";
import { showSuccessToast } from "@/lib/toast";
import type { JoinRequest } from "@/domain/types";
import type { JoinRequestWithUser } from "../services/community.service";
import {
  approveJoinRequest,
  rejectJoinRequest,
  type CommunityMembershipActionResult,
} from "../services/communityMembership.service";

const REJECT_REASON_MAX = 500;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRequestedAt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: JoinRequest["status"]): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "approved":
      return "Aprovada";
    case "rejected":
      return "Recusada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

interface JoinRequestCardProps {
  row: JoinRequestWithUser;
  viewerId: string;
  onChanged: () => void;
}

function JoinRequestModerationCard({ row, viewerId, onChanged }: JoinRequestCardProps) {
  const { request, user } = row;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const run = async (fn: () => Promise<CommunityMembershipActionResult>, successToast?: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fn();
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (successToast) showSuccessToast(successToast, { id: "woody-community-join-requests" });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const isPending = request.status === "pending";

  return (
    <li
      className={cn(
        woodySurface.card,
        "list-none border border-[var(--woody-accent)]/12 p-4 sm:p-5"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link
          to={profilePathForUser(user)}
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl transition-colors hover:bg-[var(--woody-nav)]/6",
            woodyFocus.ring
          )}
        >
          <Avatar className="size-11 shrink-0 sm:size-12">
            <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-xs font-semibold text-[var(--woody-text)]">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-left">
            <p className="truncate font-semibold text-[var(--woody-text)]">{user.name}</p>
            <p className="truncate text-sm text-[var(--woody-muted)]">@{user.username}</p>
            <p className="mt-1 text-xs text-[var(--woody-muted)]">Pedido em {formatRequestedAt(request.requestedAt)}</p>
            <span
              className={cn(
                "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ring-1",
                request.status === "pending" &&
                  "bg-[var(--woody-nav)]/10 text-[var(--woody-text)] ring-[var(--woody-nav)]/18",
                request.status !== "pending" &&
                  "bg-[var(--woody-muted)]/10 text-[var(--woody-muted)] ring-[var(--woody-accent)]/12"
              )}
            >
              {statusLabel(request.status)}
            </span>
          </div>
        </Link>

        {isPending ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[11rem]">
            <Button
              type="button"
              size="sm"
              disabled={busy}
              className={cn(woodyFocus.ring, "w-full rounded-xl font-semibold")}
              onClick={() =>
                void run(() => approveJoinRequest(viewerId, request.id), "Solicitação aprovada.")
              }
            >
              {busy ? "Processando…" : "Aprovar"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              className={cn(
                woodyFocus.ring,
                "w-full rounded-xl border-red-500/30 font-semibold text-red-700 hover:bg-red-500/8 dark:text-red-300"
              )}
              onClick={() => {
                setRejectReason("");
                setRejectOpen(true);
              }}
            >
              Recusar
            </Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md border-[var(--woody-accent)]/15 bg-[var(--woody-card)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--woody-text)]">Recusar pedido de {user.name}</DialogTitle>
            <DialogDescription className="text-[var(--woody-muted)]">
              Opcional: indica um motivo (máx. {REJECT_REASON_MAX} caracteres). A pessoa pode voltar a pedir entrada,
              conforme as regras do espaço.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value.slice(0, REJECT_REASON_MAX))}
            placeholder="Motivo (opcional)"
            rows={4}
            className="resize-none border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)]"
          />
          <p className="text-right text-xs text-[var(--woody-muted)] tabular-nums">
            {rejectReason.length}/{REJECT_REASON_MAX}
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={() => setRejectOpen(false)}>
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              className={woodyFocus.ring}
              onClick={() =>
                void run(async () => {
                  const r = await rejectJoinRequest(viewerId, request.id, {
                    reason: rejectReason.trim() || null,
                  });
                  if (r.ok) {
                    setRejectOpen(false);
                    setRejectReason("");
                  }
                  return r;
                }, "Solicitação recusada.")
              }
            >
              {busy ? "Processando…" : "Confirmar recusa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}

export interface CommunityJoinRequestsTabProps {
  communityName: string;
  viewerId: string;
  rows: JoinRequestWithUser[];
  /** Incrementa quando a página recarrega dados da API. */
  listRevision: number;
  onListChanged: () => void;
  /** Quando o `GET` de pedidos devolve 403. */
  forbiddenMessage: string | null;
}

export function CommunityJoinRequestsTab({
  communityName,
  viewerId,
  rows,
  listRevision,
  onListChanged,
  forbiddenMessage,
}: CommunityJoinRequestsTabProps) {
  void listRevision;
  const pending = useMemo(() => rows.filter((r) => r.request.status === "pending"), [rows]);

  return (
    <section className="w-full min-w-0" aria-labelledby="community-join-requests-heading">
      <div className="mb-6 flex items-start gap-3 border-b border-[var(--woody-accent)]/10 pb-6">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]"
          aria-hidden
        >
          <Inbox className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 id="community-join-requests-heading" className="text-lg font-bold text-[var(--woody-text)] sm:text-xl">
            Solicitações de entrada
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)]">
            Pedidos para participar em <span className="font-medium text-[var(--woody-text)]/90">{communityName}</span>
            . Aprovar ou recusar atualiza a lista e notifica a pessoa.
          </p>
        </div>
      </div>

      {forbiddenMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm font-medium text-red-800 dark:text-red-200"
        >
          {forbiddenMessage}
        </div>
      ) : pending.length === 0 ? (
        <div
          className={cn(
            woodySurface.emptyDashed,
            "flex flex-col items-center justify-center px-6 py-12 text-center text-[var(--woody-muted)]"
          )}
        >
          <p className="text-sm font-medium text-[var(--woody-text)]">Nenhuma solicitação pendente.</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            Quando alguém pedir acesso, o pedido aparece aqui e no diálogo «Moderar membros».
          </p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0 sm:gap-5">
          {pending.map((row) => (
            <JoinRequestModerationCard key={row.request.id} row={row} viewerId={viewerId} onChanged={onListChanged} />
          ))}
        </ul>
      )}
    </section>
  );
}
