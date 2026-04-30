import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationBellProps extends React.ComponentPropsWithoutRef<"button"> {
  variant: "toolbar" | "mobileHeader";
  /** Texto acessível (ex.: “Notificações — 2 novas”). */
  label: string;
  /** Contagem numérica para o badge (0 = sem número). */
  inAppUnreadCount: number;
  /** Há sinais de perfil por ler (mostra ponto se não houver contagem in-app). */
  signalsUnread: boolean;
}

const bellWrap = "relative";

/**
 * Botão do sino com badge (in-app) ou ponto (só sinais).
 * No desktop usar com `PopoverTrigger asChild` (ref e onClick são injetados pelo Radix).
 */
export const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>(
  function NotificationBell(
    {
      variant,
      label,
      inAppUnreadCount,
      signalsUnread,
      className,
      type = "button",
      children,
      ...rest
    },
    ref
  ) {
    const toolbarBtn =
      "size-10 flex items-center justify-center rounded-full text-[var(--woody-text)] hover:bg-black/5 transition-colors shrink-0";
    const mobileBtn =
      "size-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors shrink-0";

    const badgeLabel =
      inAppUnreadCount > 0
        ? inAppUnreadCount > 99
          ? "99+"
          : String(inAppUnreadCount)
        : signalsUnread
          ? "•"
          : null;

    const hasBadge = badgeLabel != null;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(variant === "toolbar" ? toolbarBtn : mobileBtn, bellWrap, className)}
        aria-label={label}
        {...rest}
      >
        <Bell className="size-5" aria-hidden />
        {children}
        {hasBadge ? (
          <span
            className={cn(
              "pointer-events-none absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--woody-nav)] px-1 text-[0.65rem] font-semibold leading-none text-white ring-2",
              variant === "toolbar" ? "ring-[var(--woody-main-surface)]" : "ring-[var(--woody-sidebar)]"
            )}
            aria-hidden
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>
    );
  }
);

NotificationBell.displayName = "NotificationBell";
