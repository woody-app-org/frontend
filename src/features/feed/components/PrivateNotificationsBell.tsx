import { Link } from "react-router-dom";
import { Bell, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useProfileSignalsUnreadCount } from "@/features/profile/hooks/useProfileSignalsUnreadCount";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const bellWrap = "relative";
const badgeDot =
  "pointer-events-none absolute top-1.5 right-1.5 min-h-[6px] min-w-[6px] rounded-full bg-[var(--woody-nav)] ring-2 ring-[var(--woody-main-surface)]";
const badgeDotOnDark =
  "pointer-events-none absolute top-1.5 right-1.5 min-h-[6px] min-w-[6px] rounded-full bg-[var(--woody-nav)] ring-2 ring-[var(--woody-sidebar)]";

export interface PrivateNotificationsBellProps {
  variant: "toolbar" | "mobileHeader";
}

/**
 * Sino do layout principal: área privada (sinais recebidos) + indicador discreto quando há não lidos.
 * Não substitui um centro de notificações completo — integra-se ao que já existe (perfil / mensagens).
 */
export function PrivateNotificationsBell({ variant }: PrivateNotificationsBellProps) {
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useProfileSignalsUnreadCount(Boolean(isAuthenticated && user?.id));

  const toolbarBtn =
    "size-10 flex items-center justify-center rounded-full text-[var(--woody-text)] hover:bg-black/5 transition-colors shrink-0";
  const mobileBtn =
    "size-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors shrink-0";

  const signalsHref = user?.id ? `/profile/${user.id}?tab=signals` : "/feed";
  const hasUnread = unreadCount > 0;
  const label =
    hasUnread && unreadCount === 1
      ? "Notificações — 1 sinal novo"
      : hasUnread
        ? `Notificações — ${unreadCount} sinais novos`
        : "Notificações";

  if (!isAuthenticated || !user?.id) {
    return (
      <button type="button" className={cn(variant === "toolbar" ? toolbarBtn : mobileBtn, bellWrap)} aria-label="Notificações">
        <Bell className="size-5" />
        <span className={variant === "toolbar" ? badgeDot : badgeDotOnDark} aria-hidden />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(variant === "toolbar" ? toolbarBtn : mobileBtn, bellWrap)} aria-label={label}>
          <Bell className="size-5" />
          {hasUnread ? <span className={variant === "toolbar" ? badgeDot : badgeDotOnDark} aria-hidden /> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[260px] border-[var(--woody-divider)] bg-[var(--woody-card)] p-1 shadow-lg">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-[var(--woody-muted)]">
          Área privada
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--woody-divider)]" />
        <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-2.5">
          <Link to={signalsHref} className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium text-[var(--woody-text)]">Sinais recebidos</span>
              <span className="text-xs leading-snug text-[var(--woody-muted)]">
                {hasUnread
                  ? unreadCount === 1
                    ? "Tens 1 sinal por ler."
                    : `Tens ${unreadCount} sinais por ler.`
                  : "Quando alguém te enviar um flerte, aparece aqui."}
              </span>
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
