import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/context/AuthContext";
import { LogoutConfirmationDialog } from "@/features/auth/components/LogoutConfirmationDialog";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

const triggerClass =
  "size-11 md:size-10 flex items-center justify-center rounded-full hover:bg-[var(--woody-nav)]/10 overflow-hidden ring-1 ring-[var(--woody-divider)] shrink-0";

const avatarImgClass = "size-8 rounded-full object-cover md:size-8";

export interface UserAccountMenuProps {
  /** Estilo do botão no header (tema claro). */
  className?: string;
}

/**
 * Avatar no header com menu: perfil e sair (mock + redirect para `/auth`).
 */
export function UserAccountMenu({ className }: UserAccountMenuProps) {
  const navigate = useNavigate();
  const { user, logoutAsync } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  if (!user) {
    return (
      <Link
        to="/auth/login"
        className={cn(triggerClass, className)}
        aria-label="Entrar"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]">
          <User className="size-[1.35rem]" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(triggerClass, "p-0 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10", woodyFocus.ring, className)}
            aria-label="Menu da conta"
            aria-haspopup="menu"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className={avatarImgClass} />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]">
                <User className="size-[1.35rem]" aria-hidden />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-[12.5rem] border-[var(--woody-accent)]/20 bg-[var(--woody-card)] text-[var(--woody-text)]"
        >
          <DropdownMenuLabel className="font-normal">
            <span className="block truncate text-sm font-semibold text-[var(--woody-text)]">
              {user.name ?? user.username}
            </span>
            {user.email ? (
              <span className="block truncate text-xs text-[var(--woody-muted)]">{user.email}</span>
            ) : (
              <span className="block truncate text-xs text-[var(--woody-muted)]">@{user.username}</span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[var(--woody-accent)]/15" />
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--woody-nav)]/10">
            <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
              <User className="size-4 opacity-80" aria-hidden />
              Meu perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--woody-nav)]/10">
            <Link to="/planos" className="flex items-center gap-2">
              <Sparkles className="size-4 opacity-80 text-[var(--woody-nav)]" aria-hidden />
              Planos e assinatura
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[var(--woody-accent)]/15" />
          <DropdownMenuItem
            className="cursor-pointer text-[var(--woody-muted)] focus:bg-[var(--woody-nav)]/10 focus:text-[var(--woody-text)]"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="size-4 opacity-80" aria-hidden />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmationDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        isPending={logoutPending}
        onConfirm={async () => {
          setLogoutPending(true);
          try {
            await logoutAsync();
            setLogoutOpen(false);
            navigate("/auth", { replace: true });
          } finally {
            setLogoutPending(false);
          }
        }}
      />
    </>
  );
}
