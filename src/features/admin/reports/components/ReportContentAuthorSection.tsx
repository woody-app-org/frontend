import { useState, useCallback } from "react";
import { ShieldBan, Clock, RotateCcw, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/lib/toast/woodyToast";
import {
  banReportAuthor,
  isReportUserBanned,
  isReportUserSuspended,
  reactivateUser,
  suspendUser,
  getReactivateUserErrorMessage,
  type ReportUserPreview,
} from "../services/adminReports.service";
import { getUserInitials, formatDateLong } from "../utils/reportHelpers";
import { BanReportAuthorDialog } from "./BanReportAuthorDialog";
import { SuspendUserDialog } from "./SuspendUserDialog";

interface ReportContentAuthorSectionProps {
  reportId: number;
  author: ReportUserPreview;
  onBanned: () => void | Promise<void>;
}

export function ReportContentAuthorSection({
  reportId,
  author,
  onBanned,
}: ReportContentAuthorSectionProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const isBanned = isReportUserBanned(author);
  const isSuspended = isReportUserSuspended(author);

  const handleConfirmBan = useCallback(
    async (payload: { reason: string; internalNote?: string }) => {
      await banReportAuthor(reportId, payload);
      await onBanned();
    },
    [reportId, onBanned]
  );

  const handleConfirmSuspend = useCallback(
    async (payload: { reason: string; durationHours: number }) => {
      await suspendUser(author.id, payload);
      await onBanned();
    },
    [author.id, onBanned]
  );

  const handleReactivate = useCallback(async () => {
    if (isReactivating) return;
    setIsReactivating(true);
    try {
      await reactivateUser(author.id);
      showSuccessToast("Conta reativada.", { id: "reactivate-user-success" });
      await onBanned();
    } catch (err) {
      showErrorToast(getReactivateUserErrorMessage(err), { id: "reactivate-user-error" });
    } finally {
      setIsReactivating(false);
    }
  }, [author.id, isReactivating, onBanned]);

  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
        Autora do conteúdo
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AuthorPreview user={author} />
        <div className="flex flex-col items-end gap-2 shrink-0">
          {isBanned ? (
            <BannedBadge />
          ) : isSuspended ? (
            <>
              <SuspendedBadge suspendedUntil={author.suspendedUntil} />
              <button
                type="button"
                onClick={handleReactivate}
                disabled={isReactivating}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80",
                  "bg-white px-3 py-1.5 text-xs font-medium text-emerald-700",
                  "hover:bg-emerald-50 transition-colors disabled:opacity-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                )}
              >
                {isReactivating ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="size-3.5" aria-hidden />
                )}
                Reativar conta
              </button>
            </>
          ) : (
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setSuspendDialogOpen(true)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-amber-200/80",
                  "bg-white px-3 py-1.5 text-xs font-medium text-amber-700",
                  "hover:bg-amber-50 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
                )}
              >
                <Clock className="size-3.5" aria-hidden />
                Suspender temporariamente
              </button>
              <button
                type="button"
                onClick={() => setBanDialogOpen(true)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-red-200/80",
                  "bg-white px-3 py-1.5 text-xs font-medium text-red-700",
                  "hover:bg-red-50 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                )}
              >
                <ShieldBan className="size-3.5" aria-hidden />
                Banir conta
              </button>
            </div>
          )}
        </div>
      </div>

      <BanReportAuthorDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        author={author}
        onConfirm={handleConfirmBan}
      />

      <SuspendUserDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        author={author}
        onConfirm={handleConfirmSuspend}
      />
    </div>
  );
}

function AuthorPreview({ user }: { user: ReportUserPreview }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar>
        {user.avatarUrl && (
          <AvatarImage src={resolvePublicMediaUrl(user.avatarUrl)} alt={user.username} />
        )}
        <AvatarFallback className="text-xs bg-[var(--auth-button)]/15 text-[var(--auth-button-hover)]">
          {getUserInitials(user.name, user.username)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-[var(--woody-ink)] text-sm truncate">{user.name}</p>
        <p className="text-xs text-zinc-400">@{user.username}</p>
      </div>
    </div>
  );
}

function BannedBadge({ bannedAt }: { bannedAt?: string | null }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200/80">
        <ShieldBan className="size-3" aria-hidden />
        Conta banida
      </span>
      {bannedAt && (
        <span className="text-xs text-zinc-400">desde {formatDateLong(bannedAt)}</span>
      )}
    </div>
  );
}

function SuspendedBadge({ suspendedUntil }: { suspendedUntil?: string | null }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/80">
        <Clock className="size-3" aria-hidden />
        Conta suspensa
      </span>
      {suspendedUntil && (
        <span className="text-xs text-zinc-400">até {formatDateLong(suspendedUntil)}</span>
      )}
    </div>
  );
}
