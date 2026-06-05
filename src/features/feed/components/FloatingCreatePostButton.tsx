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

  const visible = shouldShowFloatingCreatePost(location.pathname, { viewer: user ?? undefined });
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => openCreatePostModal()}
      aria-label="Nova publicação"
      className={cn(
        woodyFocus.ring,
        "group fixed z-[50] flex size-14 items-center justify-center rounded-full",
        "border-0 bg-[var(--woody-nav)] text-white",
        "shadow-[0_4px_20px_rgba(10,10,10,0.14),0_2px_8px_rgba(139,195,74,0.35)]",
        "transition-[transform,box-shadow,background-color] duration-200 ease-out",
        "motion-reduce:transition-colors motion-reduce:duration-150",
        /* Hover só desktop (pointer fine) */
        "md:hover:scale-[1.03] md:hover:bg-[var(--woody-nav)]/92",
        "md:hover:shadow-[0_6px_24px_rgba(10,10,10,0.16),0_4px_14px_rgba(139,195,74,0.42)]",
        /* Toque / click: leve compressão */
        "active:scale-[0.97] active:bg-[var(--woody-nav)]/88",
        "motion-reduce:md:hover:scale-100 motion-reduce:active:scale-100",
        "motion-reduce:md:hover:shadow-[0_4px_20px_rgba(10,10,10,0.14),0_2px_8px_rgba(139,195,74,0.35)]",
        /* Acima da bottom navigation (≈4.5rem + safe area) no mobile; canto no desktop */
        "right-4 max-md:bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] md:bottom-8 md:right-8",
        className
      )}
    >
      <Plus
        className={cn(
          "size-7 stroke-[2.25]",
          "transition-transform duration-200 ease-out",
          "md:group-hover:rotate-[22deg]",
          "motion-reduce:transition-none motion-reduce:md:group-hover:rotate-0"
        )}
        aria-hidden
      />
    </button>
  );
}
