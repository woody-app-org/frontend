import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useCreatePostComposer } from "../context/CreatePostComposerContext";
import { shouldShowFloatingCreatePost } from "../lib/createPostPublicationContext";

export interface FloatingCreatePostButtonProps {
  /** Esconder quando o layout está em modo imersivo (ex.: chat móvel). */
  hidden?: boolean;
  className?: string;
}

/**
 * FAB global para abrir o compositor com contexto derivado da rota (perfil vs comunidade).
 */
export function FloatingCreatePostButton({ hidden, className }: FloatingCreatePostButtonProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { openCreatePostModal } = useCreatePostComposer();

  if (hidden) return null;

  const visible = shouldShowFloatingCreatePost(location.pathname, { viewerUserId: user?.id });
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => openCreatePostModal()}
      aria-label="Nova publicação"
      className={cn(
        woodyFocus.ring,
        "fixed z-[50] flex size-14 items-center justify-center rounded-full",
        "border-2 border-[var(--woody-text)]/15 bg-[var(--woody-card)] text-[var(--woody-text)]",
        "shadow-[0_6px_28px_rgba(10,10,10,0.12),0_2px_8px_rgba(10,10,10,0.06)]",
        "transition-[transform,box-shadow,border-color,background-color] duration-200",
        "hover:scale-[1.04] hover:border-[var(--woody-nav)]/45 hover:shadow-[0_8px_32px_rgba(139,195,74,0.18),0_4px_12px_rgba(10,10,10,0.08)]",
        "active:scale-[0.96] active:duration-100",
        /* Acima da bottom navigation (≈4.5rem + safe area) no mobile; canto no desktop */
        "right-4 max-md:bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] md:bottom-8 md:right-8",
        className
      )}
    >
      <Plus className="size-7 stroke-[2.25]" aria-hidden />
    </button>
  );
}
