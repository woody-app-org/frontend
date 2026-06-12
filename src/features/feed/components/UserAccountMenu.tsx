import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LifeBuoy, LogOut, ScrollText, Sparkles, Trash2, User, UserX } from "lucide-react";
import { BlockedUsersDialog } from "@/features/users/components/BlockedUsersDialog";
import { DeleteAccountDialog } from "@/features/auth/components/DeleteAccountDialog";
import { deleteOwnAccount } from "@/features/auth/services/auth.service";
import { showErrorToast } from "@/lib/toast";
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
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { resolvePublicMediaUrl } from "@/lib/api";

const triggerClass =
  "size-11 md:size-10 flex items-center justify-center rounded-full hover:bg-[var(--woody-nav)]/10 overflow-hidden shrink-0";

const avatarImgClass = "size-8 rounded-full object-cover md:size-8";

export interface UserAccountMenuProps {
  /** Estilo do botão no header (tema claro). */
  className?: string;
  /** `inverse`: header escuro (mobile) — ícone e anéis em claro. */
  variant?: "surface" | "inverse";
}

/**
 * Avatar no header com menu: perfil e sair (mock + redirect para `/auth`).
 */
export function UserAccountMenu({ className, variant = "surface" }: UserAccountMenuProps) {
  const navigate = useNavigate();
  const { user, logoutAsync } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [menuAvatarFailed, setMenuAvatarFailed] = useState(false);
  const [blockedUsersOpen, setBlockedUsersOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteAccountPending, setDeleteAccountPending] = useState(false);

  useEffect(() => {
    setMenuAvatarFailed(false);
  }, [user?.avatarUrl]);

  const resolvedMenuAvatarUrl = user?.avatarUrl
    ? resolvePublicMediaUrl(user.avatarUrl)
    : "";
  const showMenuAvatar =
    Boolean(user?.avatarUrl && resolvedMenuAvatarUrl && !menuAvatarFailed);

  const guestIconClass =
    variant === "inverse"
      ? "flex size-8 items-center justify-center rounded-full bg-white/15 text-white"
      : "flex size-8 items-center justify-center rounded-full bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]";

  const triggerTone =
    variant === "inverse"
      ? cn(triggerClass, "text-white hover:bg-white/10")
      : triggerClass;

  if (!user) {
    return (
      <Link
        to="/auth/login"
        className={cn(triggerTone, variant === "inverse" ? woodyFocus.ringSidebar : woodyFocus.ring, className)}
        aria-label="Entrar"
      >
        <span className={guestIconClass}>
          <User className="size-[1.35rem]" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              triggerTone,
              "p-0",
              variant === "inverse" ? "" : "text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10",
              variant === "inverse" ? woodyFocus.ringSidebar : woodyFocus.ring,
              className
            )}
            aria-label="Menu da conta"
            aria-haspopup="menu"
          >
            {showMenuAvatar ? (
              <img
                src={resolvedMenuAvatarUrl}
                alt=""
                className={avatarImgClass}
                onError={() => {
                  if (import.meta.env.DEV) {
                    console.warn("[Woody] Account menu avatar failed to load", resolvedMenuAvatarUrl);
                  }
                  setMenuAvatarFailed(true);
                }}
              />
            ) : (
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  variant === "inverse"
                    ? "bg-white/15 text-white"
                    : "bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]"
                )}
              >
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
            <Link to={profilePathForUser(user)} className="flex items-center gap-2">
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
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--woody-nav)]/10">
            <Link to="/support" className="flex items-center gap-2">
              <LifeBuoy className="size-4 opacity-80 text-[var(--woody-nav)]" aria-hidden />
              Suporte
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--woody-nav)]/10">
            <Link to="/institutional/politicas" className="flex items-center gap-2">
              <ScrollText className="size-4 opacity-80 text-[var(--woody-nav)]" aria-hidden />
              Políticas
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer focus:bg-[var(--woody-nav)]/10"
            onClick={() => setBlockedUsersOpen(true)}
          >
            <UserX className="size-4 opacity-80 text-[var(--woody-nav)]" aria-hidden />
            Usuárias bloqueadas
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950"
            onClick={() => setDeleteAccountOpen(true)}
          >
            <Trash2 className="size-4 opacity-80" aria-hidden />
            Excluir conta
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

      <BlockedUsersDialog open={blockedUsersOpen} onOpenChange={setBlockedUsersOpen} />
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        username={user.username}
        isPending={deleteAccountPending}
        onConfirm={async () => {
          setDeleteAccountPending(true);
          try {
            await deleteOwnAccount(user.username);
            setDeleteAccountOpen(false);
            navigate("/auth", { replace: true });
          } catch (e) {
            showErrorToast(e instanceof Error ? e.message : "Não foi possível excluir a conta.");
          } finally {
            setDeleteAccountPending(false);
          }
        }}
      />
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
