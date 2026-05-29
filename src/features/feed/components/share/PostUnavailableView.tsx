import { Link } from "react-router-dom";
import { WoodyLogo } from "@/components/branding/WoodyLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isBetaClosed } from "@/config/beta";

export interface PostUnavailableViewProps {
  /** Layout completo com header (visitante anónima). */
  showPublicShell?: boolean;
  className?: string;
}

export function PostUnavailableView({ showPublicShell = false, className }: PostUnavailableViewProps) {
  const enterHref = isBetaClosed() ? "/auth/login" : "/auth";

  const content = (
    <div
      className={cn(
        "rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-card)] px-6 py-8 text-center shadow-[0_2px_14px_rgba(10,10,10,0.045)]",
        className
      )}
    >
      <h1 className="text-lg font-semibold text-[var(--woody-text)]">Este conteúdo não está disponível.</h1>
      <p className="mt-2 text-sm text-[var(--woody-muted)]">
        A publicação pode ter sido removida ou não está acessível neste momento.
      </p>
      {showPublicShell ? (
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90">
            <Link to={enterHref}>Entrar na Woody</Link>
          </Button>
          <Button asChild variant="outline" className="border-[var(--woody-accent)]/20">
            <Link to="/landing">Conhecer a Woody</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <Button asChild variant="outline" className="border-[var(--woody-accent)]/20">
            <Link to="/feed">Voltar ao feed</Link>
          </Button>
        </div>
      )}
    </div>
  );

  if (!showPublicShell) {
    return content;
  }

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#f4f2ec_0%,#f0efe8_55%,#ebe8df_100%)] text-[var(--woody-ink)]">
      <header className="border-b border-black/[0.06] bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link
            to="/landing"
            className="outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--woody-lime)]/45"
          >
            <WoodyLogo className="h-7 w-auto sm:h-8" />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 sm:px-6 sm:py-14">{content}</main>
    </div>
  );
}
