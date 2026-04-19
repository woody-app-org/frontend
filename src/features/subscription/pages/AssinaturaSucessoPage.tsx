import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchMySubscriptionState } from "@/features/auth/services/auth.service";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { isProUser } from "@/features/subscription/subscriptionCapabilities";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout, woodySurface } from "@/lib/woody-ui";

export function AssinaturaSucessoPage() {
  const { patchUser } = useAuth();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sub = await fetchMySubscriptionState();
        if (cancelled) return;
        patchUser({ subscription: sub });
        if (isProUser(sub)) {
          setHint("O teu Woody Pro já está refletido nesta sessão.");
        } else {
          setHint(
            "Se o pagamento foi concluído, o servidor pode ainda estar a confirmar a subscrição. Volta ao feed ou atualiza dentro de instantes — o estado oficial vem sempre da API, não desta página."
          );
        }
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patchUser]);

  return (
    <FeedLayout>
      <div className={cn("mx-auto w-full max-w-lg pb-20 md:pb-8", woodyLayout.pagePadWide, woodyLayout.stackGapTight)}>
        <section
          className={cn(
            woodySurface.cardHero,
            "space-y-4 rounded-2xl border border-[var(--woody-accent)]/16 px-5 py-8 sm:px-8"
          )}
        >
          {phase === "loading" ? (
            <div className="flex items-center gap-3 text-[var(--woody-muted)]">
              <Loader2 className="size-5 animate-spin text-[var(--woody-nav)]" aria-hidden />
              <p className="text-sm">A sincronizar o estado da conta…</p>
            </div>
          ) : null}

          {phase === "error" ? (
            <p className="text-sm text-[var(--woody-text)]">
              Não foi possível atualizar o estado local. Tenta abrir o teu perfil ou faz novamente login para
              refrescar a sessão.
            </p>
          ) : null}

          {phase === "ready" ? (
            <>
              <h1 className="text-xl font-bold text-[var(--woody-text)] sm:text-2xl">Obrigada!</h1>
              <p className="text-sm leading-relaxed text-[var(--woody-muted)]">{hint}</p>
            </>
          ) : null}

          <Button asChild className={cn(woodyFocus.ring, "bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90")}>
            <Link to="/feed">Ir para o feed</Link>
          </Button>
        </section>
      </div>
    </FeedLayout>
  );
}
