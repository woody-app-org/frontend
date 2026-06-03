import { useState, useCallback } from "react";
import { ShieldBan } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  banReportAuthor,
  isReportUserBanned,
  type ReportUserPreview,
} from "../services/adminReports.service";
import { getUserInitials, formatDateLong } from "../utils/reportHelpers";
import { BanReportAuthorDialog } from "./BanReportAuthorDialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const isBanned = isReportUserBanned(author);

  const handleConfirmBan = useCallback(
    async (payload: { reason: string; internalNote?: string }) => {
      await banReportAuthor(reportId, payload);
      await onBanned();
    },
    [reportId, onBanned]
  );

  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
        Autora do conteúdo
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AuthorPreview user={author} />
        <div className="flex flex-col items-start gap-2 shrink-0">
          {isBanned ? (
            <BannedBadge />
          ) : (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
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
          )}
        </div>
      </div>

      <BanReportAuthorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        author={author}
        onConfirm={handleConfirmBan}
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
