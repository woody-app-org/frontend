import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout, woodySurface } from "@/lib/woody-ui";

export function AssinaturaCanceladaPage() {
  return (
    <FeedLayout>
      <div className={cn("mx-auto w-full max-w-lg pb-20 md:pb-8", woodyLayout.pagePadWide, woodyLayout.stackGapTight)}>
        <section
          className={cn(
            woodySurface.cardHero,
            "space-y-4 rounded-2xl border border-[var(--woody-accent)]/16 px-5 py-8 sm:px-8"
          )}
        >
          <h1 className="text-xl font-bold text-[var(--woody-text)] sm:text-2xl">Checkout cancelado</h1>
          <p className="text-sm leading-relaxed text-[var(--woody-muted)]">
            Não foi feita qualquer alteração ao teu plano. Podes voltar a subscrever quando quiseres.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className={cn(woodyFocus.ring, "border-[var(--woody-accent)]/25")}>
              <Link to="/communities">Comunidades</Link>
            </Button>
            <Button asChild className={cn(woodyFocus.ring, "bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90")}>
              <Link to="/feed">Feed</Link>
            </Button>
          </div>
        </section>
      </div>
    </FeedLayout>
  );
}
