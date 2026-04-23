import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Lock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CommunityPremiumCapabilities } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import {
  fetchCommunityPremiumAnalytics,
  startCommunityPremiumUpgrade,
  type CommunityPremiumAnalyticsPayload,
} from "../services/community.service";

export interface CommunityGrowthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
  communitySlug: string;
  communityName: string;
  capabilities: CommunityPremiumCapabilities | undefined;
}

export function CommunityGrowthDialog({
  open,
  onOpenChange,
  communityId,
  communitySlug,
  communityName,
  capabilities,
}: CommunityGrowthDialogProps) {
  const [analytics, setAnalytics] = useState<CommunityPremiumAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const staff = capabilities?.isStaffForPremiumTools ?? false;
  const premium = capabilities?.communityPremiumActive ?? false;
  const canSeeAnalytics = staff && premium;

  const load = useCallback(async () => {
    if (!canSeeAnalytics) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommunityPremiumAnalytics(communityId);
      setAnalytics(data);
    } catch (e) {
      setAnalytics(null);
      setError(e instanceof Error ? e.message : "Não foi possível carregar o resumo.");
    } finally {
      setLoading(false);
    }
  }, [canSeeAnalytics, communityId]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const handleUpgrade = async () => {
    setCheckoutBusy(true);
    setError(null);
    try {
      await startCommunityPremiumUpgrade(communityId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível iniciar o checkout.");
      setCheckoutBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto border-[var(--woody-accent)]/18 bg-[var(--woody-card)] sm:max-w-md"
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--woody-text)]">
            <BarChart3 className="size-5 text-[var(--woody-nav)]" aria-hidden />
            Crescimento · {communityName}
          </DialogTitle>
          <DialogDescription className="text-left text-[var(--woody-muted)]">
            Analytics e ferramentas de destaque dependem do plano premium do espaço e do teu papel de
            administração.
          </DialogDescription>
        </DialogHeader>

        {!staff ? (
          <p className="text-sm text-[var(--woody-muted)]">Apenas owner ou admin pode aceder a esta área.</p>
        ) : !premium ? (
          <div className="flex flex-col gap-4 rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-bg)] p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 size-5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-[var(--woody-text)]">Plano premium da comunidade</p>
                <p className="text-sm leading-relaxed text-[var(--woody-muted)]">
                  Ativa o Woody Premium deste espaço para ver resumo de métricas e impulsionar publicações.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className={cn(woodyFocus.ring, "w-full gap-2 bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/92")}
              disabled={checkoutBusy}
              onClick={() => void handleUpgrade()}
            >
              <Sparkles className="size-4" aria-hidden />
              {checkoutBusy ? "A redirecionar…" : "Subscrever premium da comunidade"}
            </Button>
            {error ? (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-[var(--woody-muted)]">A carregar resumo…</p>
            ) : error ? (
              <div className="space-y-3">
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className={cn(woodyFocus.ring, "w-full border-[var(--woody-accent)]/22")}
                >
                  <Link
                    to={`/communities/${encodeURIComponent(communitySlug)}/admin`}
                    onClick={() => onOpenChange(false)}
                  >
                    Abrir painel completo
                  </Link>
                </Button>
              </div>
            ) : analytics ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--woody-muted)]">Membros</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--woody-text)]">{analytics.memberCount}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-bg)] p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--woody-muted)]">Posts (total)</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--woody-text)]">{analytics.totalPosts}</p>
                  </div>
                </div>
                {analytics.current ? (
                  <p className="text-xs leading-relaxed text-[var(--woody-muted)]">
                    Últimos {analytics.periodDays ?? 30} dias:{" "}
                    <span className="font-medium text-[var(--woody-text)]/90">
                      +{analytics.current.newMembersJoined} entradas
                    </span>
                    ,{" "}
                    <span className="font-medium text-[var(--woody-text)]/90">
                      {analytics.current.memberLeavesRecorded} saídas (agregado)
                    </span>
                    , {analytics.current.postsPublished} posts, {analytics.current.commentsPosted} comentários.
                  </p>
                ) : null}
                <Button
                  asChild
                  variant="outline"
                  className={cn(woodyFocus.ring, "w-full border-[var(--woody-accent)]/22")}
                >
                  <Link to={`/communities/${encodeURIComponent(communitySlug)}/admin`} onClick={() => onOpenChange(false)}>
                    Abrir painel completo
                  </Link>
                </Button>
              </div>
            ) : null}
            {analytics?.note ? (
              <p className="text-xs leading-relaxed text-[var(--woody-muted)]">{analytics.note}</p>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
