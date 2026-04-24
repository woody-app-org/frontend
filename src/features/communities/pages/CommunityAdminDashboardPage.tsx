import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout } from "@/lib/woody-ui";
import {
  fetchCommunityBySlug,
  fetchCommunityPostBoosts,
  fetchCommunityPremiumAnalytics,
  fetchMyCommunityMembership,
  type CommunityPostBoostListItem,
  type CommunityPremiumDashboardPayload,
} from "../services/community.service";
import { isAxiosError } from "axios";

const PERIOD_OPTIONS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
] as const;

function formatInt(n: number): string {
  return new Intl.NumberFormat("pt-PT").format(n);
}

function formatDelta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "—" : "Sem dados no período anterior";
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs período anterior`;
}

function formatChartDayLabel(dayUtc: string): string {
  const dayPart = dayUtc.length >= 10 ? dayUtc.slice(0, 10) : dayUtc;
  const [ys, ms, ds] = dayPart.split("-");
  const y = Number(ys, 10);
  const m = Number(ms, 10);
  const d = Number(ds, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return dayUtc;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

type ChartDayRow = CommunityPremiumDashboardPayload["dailyActivity"][number] & { activityHeight: number };

function ChartDayStatsContent({ d }: { d: ChartDayRow }) {
  return (
    <>
      <p className="whitespace-nowrap text-[0.6875rem] font-semibold capitalize tracking-tight text-[var(--woody-text)]">
        {formatChartDayLabel(d.dayUtc)}
      </p>
      <dl className="mt-1.5 space-y-1 text-[0.625rem] leading-tight text-[var(--woody-muted)]">
        <div className="flex justify-between gap-4">
          <dt>Posts</dt>
          <dd className="tabular-nums font-medium text-[var(--woody-text)]">{formatInt(d.posts)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Comentários</dt>
          <dd className="tabular-nums font-medium text-[var(--woody-text)]">{formatInt(d.comments)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Visitas</dt>
          <dd className="tabular-nums font-medium text-[var(--woody-text)]">{formatInt(d.pageViews)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Novos membros</dt>
          <dd className="tabular-nums font-medium text-[var(--woody-text)]">{formatInt(d.newMembers)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Saídas</dt>
          <dd className="tabular-nums font-medium text-[var(--woody-text)]">{formatInt(d.memberLeaves)}</dd>
        </div>
      </dl>
    </>
  );
}

export function CommunityAdminDashboardPage() {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const slug = communitySlug ?? "";

  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string>("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "notfound" | "forbidden">("loading");
  const [forbiddenReason, setForbiddenReason] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [dashboard, setDashboard] = useState<CommunityPremiumDashboardPayload | null>(null);
  const [dashError, setDashError] = useState<string | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [activeBoosts, setActiveBoosts] = useState<CommunityPostBoostListItem[]>([]);
  const [touchChartMode, setTouchChartMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  });
  const [chartPickedDayUtc, setChartPickedDayUtc] = useState<string | null>(null);
  const chartSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const apply = () => setTouchChartMode(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) {
        setLoadState("notfound");
        return;
      }
      setLoadState("loading");
      const c = await fetchCommunityBySlug(slug);
      if (cancelled) return;
      if (!c) {
        setLoadState("notfound");
        return;
      }
      setCommunityId(c.id);
      setCommunityName(c.name);
      const membership = await fetchMyCommunityMembership(c.id);
      if (cancelled) return;
      if (!membership.premiumCapabilities?.canAccessCommunityAnalytics) {
        setForbiddenReason(
          !membership.premiumCapabilities?.isStaffForPremiumTools
            ? "Apenas owner ou admin desta comunidade pode ver o painel."
            : !membership.premiumCapabilities?.communityPremiumActive
              ? "O plano premium da comunidade precisa de estar ativo."
              : "Sem permissão para aceder ao painel."
        );
        setLoadState("forbidden");
        return;
      }
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loadDashboard = useCallback(async () => {
    if (!communityId) return;
    setDashLoading(true);
    setDashError(null);
    try {
      const data = await fetchCommunityPremiumAnalytics(communityId, periodDays);
      setDashboard(data);
      try {
        setActiveBoosts(await fetchCommunityPostBoosts(communityId));
      } catch {
        setActiveBoosts([]);
      }
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 403) {
        setDashError("Sem permissão ou premium inativo.");
      } else {
        setDashError(e instanceof Error ? e.message : "Não foi possível carregar métricas.");
      }
      setDashboard(null);
      setActiveBoosts([]);
    } finally {
      setDashLoading(false);
    }
  }, [communityId, periodDays]);

  useEffect(() => {
    if (loadState !== "ready" || !communityId) return;
    void loadDashboard();
  }, [loadState, communityId, loadDashboard]);

  const chartSeries = useMemo(() => {
    if (!dashboard?.dailyActivity?.length) return [];
    const rows = dashboard.dailyActivity;
    /* Pico para escala: posts+comentários (eixo do gráfico) + visitas/membros só para não ficar tudo “chato” no mesmo patamar. */
    const maxVal = Math.max(
      1,
      ...rows.map((d) =>
        Math.max(d.posts + d.comments, d.pageViews / 12, d.newMembers * 3, d.memberLeaves * 3)
      )
    );
    return rows.map((d) => ({
      ...d,
      activityHeight: Math.min(100, Math.round(((d.posts + d.comments) / maxVal) * 100)),
    }));
  }, [dashboard]);

  useEffect(() => {
    if (!chartPickedDayUtc) return;
    if (!chartSeries.some((x) => x.dayUtc === chartPickedDayUtc)) setChartPickedDayUtc(null);
  }, [chartSeries, chartPickedDayUtc]);

  useEffect(() => {
    if (!chartPickedDayUtc || !touchChartMode) return;
    const onPointerDown = (ev: PointerEvent) => {
      const root = chartSectionRef.current;
      if (root && !root.contains(ev.target as Node)) setChartPickedDayUtc(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [chartPickedDayUtc, touchChartMode]);

  const chartPickedIndex = useMemo(
    () => (chartPickedDayUtc ? chartSeries.findIndex((x) => x.dayUtc === chartPickedDayUtc) : -1),
    [chartSeries, chartPickedDayUtc]
  );
  const chartPickedRow = chartPickedIndex >= 0 ? chartSeries[chartPickedIndex] : null;

  if (loadState === "notfound" || !slug) {
    return (
      <FeedLayout>
        <div className={cn("mx-auto max-w-lg py-16 text-center", woodyLayout.pagePadWide)}>
          <p className="text-[var(--woody-muted)]">Comunidade não encontrada.</p>
          <Button asChild variant="outline" className={cn("mt-6", woodyFocus.ring)}>
            <Link to="/communities">Voltar às comunidades</Link>
          </Button>
        </div>
      </FeedLayout>
    );
  }

  if (loadState === "forbidden") {
    return (
      <FeedLayout>
        <div className={cn("mx-auto max-w-lg py-16 text-center", woodyLayout.pagePadWide)}>
          <BarChart3 className="mx-auto size-10 text-[var(--woody-nav)] opacity-80" aria-hidden />
          <h1 className="mt-4 text-lg font-semibold text-[var(--woody-text)]">Painel da comunidade</h1>
          <p className="mt-2 text-sm text-[var(--woody-muted)]">{forbiddenReason}</p>
          <Button asChild variant="outline" className={cn("mt-6", woodyFocus.ring)}>
            <Link to={slug ? `/communities/${encodeURIComponent(slug)}` : "/communities"}>Voltar</Link>
          </Button>
        </div>
      </FeedLayout>
    );
  }

  const c = dashboard?.current;
  const p = dashboard?.previous;

  return (
    <FeedLayout>
      <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-8 pb-20 md:pb-12", woodyLayout.pagePadWide)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to={`/communities/${encodeURIComponent(slug)}`}
              className={cn(
                woodyFocus.ring,
                "inline-flex items-center gap-1 text-sm font-medium text-[var(--woody-nav)] hover:underline"
              )}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {communityName || "Comunidade"}
            </Link>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--woody-text)]">
              <BarChart3 className="size-7 text-[var(--woody-nav)]" aria-hidden />
              Painel da comunidade
            </h1>
            <p className="mt-1 text-sm text-[var(--woody-muted)]">Métricas agregadas do espaço (últimos dias seleccionados).</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-xs leading-relaxed text-[var(--woody-muted)]">
              <li>
                <span className="font-medium text-[var(--woody-text)]/85">Papel</span>: precisas de owner/admin para ver
                este painel.
              </li>
              <li>
                <span className="font-medium text-[var(--woody-text)]/85">Plano do espaço</span>: métricas e boosts
                dependem do premium da comunidade (Stripe).
              </li>
              <li>
                <span className="font-medium text-[var(--woody-text)]/85">Woody Pro</span>: plano pessoal da conta —
                separado destas métricas.
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.days}
                type="button"
                size="sm"
                variant={periodDays === opt.days ? "default" : "outline"}
                className={cn(woodyFocus.ring, periodDays === opt.days ? "bg-[var(--woody-nav)]" : "")}
                onClick={() => setPeriodDays(opt.days)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {dashboard?.note ? (
          <p className="rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-bg)] px-4 py-3 text-xs leading-relaxed text-[var(--woody-muted)]">
            {dashboard.note}
          </p>
        ) : null}

        {dashLoading && !dashboard ? (
          <div className="flex items-center gap-2 text-sm text-[var(--woody-muted)]">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            A carregar métricas…
          </div>
        ) : null}

        {dashError ? (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {dashError}
          </p>
        ) : null}

        {dashboard && c && p ? (
          <>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Membros (total)"
                value={formatInt(dashboard.memberCount)}
                hint="Estado atual do espaço"
              />
              <MetricCard
                label="Novas entradas"
                value={formatInt(c.newMembersJoined)}
                hint={formatDelta(c.newMembersJoined, p.newMembersJoined)}
              />
              <MetricCard
                label="Saídas (agregado)"
                value={formatInt(c.memberLeavesRecorded)}
                hint={`${formatDelta(c.memberLeavesRecorded, p.memberLeavesRecorded)} · sem identificar quem saiu`}
              />
              <MetricCard
                label="Visitas (página)"
                value={formatInt(c.pageViews)}
                hint={formatDelta(c.pageViews, p.pageViews)}
              />
              <MetricCard
                label="Posts publicados"
                value={formatInt(c.postsPublished)}
                hint={formatDelta(c.postsPublished, p.postsPublished)}
              />
              <MetricCard
                label="Comentários"
                value={formatInt(c.commentsPosted)}
                hint={formatDelta(c.commentsPosted, p.commentsPosted)}
              />
              <MetricCard
                label="Gostos em posts"
                value={formatInt(c.likesOnPosts)}
                hint={formatDelta(c.likesOnPosts, p.likesOnPosts)}
              />
              <MetricCard
                label="Interações / post"
                value={dashboard.engagement.averageInteractionsPerPost.toFixed(1).replace(".", ",")}
                hint="Média no período"
              />
            </section>

            <section
              ref={chartSectionRef}
              className="rounded-2xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-5 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-[var(--woody-text)]">Atividade diária (posts + comentários)</h2>
              <p className="mt-1 text-xs text-[var(--woody-muted)]">
                Barras relativas ao pico do período seleccionado.
                {touchChartMode ? (
                  <span className="mt-1 block text-[0.6875rem] leading-snug">
                    {chartPickedDayUtc
                      ? "Usa as setas para mudar de dia. Toca fora deste cartão para fechar."
                      : "Toca num dia no gráfico para ver as métricas. As setas ajudam a navegar entre dias (as colunas são estreitas)."}
                  </span>
                ) : null}
              </p>
              {/* items-stretch: cada coluna herda h-36; senão height % nas barras resolve contra altura "auto" e some. */}
              <div className="mt-4 flex h-36 touch-pan-x touch-manipulation items-stretch gap-px overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:gap-0.5">
                {chartSeries.map((d) => (
                  <div
                    key={d.dayUtc}
                    role={touchChartMode ? "button" : undefined}
                    tabIndex={touchChartMode ? 0 : undefined}
                    aria-pressed={touchChartMode ? chartPickedDayUtc === d.dayUtc : undefined}
                    aria-label={touchChartMode ? `Dia ${formatChartDayLabel(d.dayUtc)}, tocar para ver métricas` : undefined}
                    className={cn(
                      "group relative flex min-h-0 min-w-[5px] flex-1 flex-col touch-manipulation",
                      touchChartMode && "cursor-pointer rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--woody-nav)]"
                    )}
                    onClick={
                      touchChartMode
                        ? () => {
                            setChartPickedDayUtc((prev) => (prev === d.dayUtc ? null : d.dayUtc));
                          }
                        : undefined
                    }
                    onKeyDown={
                      touchChartMode
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setChartPickedDayUtc((prev) => (prev === d.dayUtc ? null : d.dayUtc));
                            }
                          }
                        : undefined
                    }
                  >
                    <div
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-0 z-20 w-max max-w-[min(12.5rem,calc(100vw-2rem))] -translate-x-1/2",
                        "rounded-lg border border-[var(--woody-accent)]/18 bg-[var(--woody-bg)] px-2.5 py-2",
                        "shadow-md shadow-black/[0.06] ring-1 ring-black/[0.03]",
                        "transition-opacity duration-150 ease-out",
                        touchChartMode ? "hidden" : "opacity-0 group-hover:opacity-100"
                      )}
                      role="tooltip"
                    >
                      <ChartDayStatsContent d={d} />
                    </div>
                    <div className="min-h-0 flex-1" aria-hidden />
                    <div
                      className={cn(
                        "mx-auto w-full max-w-[14px] shrink-0 rounded-t-sm transition",
                        touchChartMode && chartPickedDayUtc === d.dayUtc
                          ? "bg-[var(--woody-nav)] ring-2 ring-[var(--woody-nav)] ring-offset-2 ring-offset-[var(--woody-card)]"
                          : "bg-[var(--woody-nav)]/75 group-hover:bg-[var(--woody-nav)]"
                      )}
                      style={{ height: `${Math.max(6, d.activityHeight)}%` }}
                    />
                  </div>
                ))}
              </div>

              {touchChartMode && chartPickedRow ? (
                <div className="mt-3 flex items-stretch justify-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    aria-label="Dia anterior"
                    className={cn(
                      woodyFocus.ring,
                      "touch-manipulation flex h-12 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)] shadow-sm transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35"
                    )}
                    disabled={chartPickedIndex <= 0}
                    onClick={() => {
                      const prev = chartSeries[chartPickedIndex - 1];
                      if (prev) setChartPickedDayUtc(prev.dayUtc);
                    }}
                  >
                    <ChevronLeft className="size-6" strokeWidth={2.25} aria-hidden />
                  </button>
                  <div className="min-w-0 max-w-sm flex-1 rounded-xl border border-[var(--woody-accent)]/18 bg-[var(--woody-bg)] px-3 py-2.5 shadow-sm">
                    <ChartDayStatsContent d={chartPickedRow} />
                  </div>
                  <button
                    type="button"
                    aria-label="Dia seguinte"
                    className={cn(
                      woodyFocus.ring,
                      "touch-manipulation flex h-12 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)] shadow-sm transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35"
                    )}
                    disabled={chartPickedIndex >= chartSeries.length - 1}
                    onClick={() => {
                      const next = chartSeries[chartPickedIndex + 1];
                      if (next) setChartPickedDayUtc(next.dayUtc);
                    }}
                  >
                    <ChevronRight className="size-6" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
              ) : null}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[var(--woody-text)]">Posts em destaque</h2>
                <p className="mt-1 text-xs text-[var(--woody-muted)]">Ordenados por gostos + comentários no período.</p>
                <ul className="mt-4 space-y-3">
                  {dashboard.topPosts.length === 0 ? (
                    <li className="text-sm text-[var(--woody-muted)]">Sem posts no período.</li>
                  ) : (
                    dashboard.topPosts.map((post) => (
                      <li
                        key={post.postId}
                        className="flex flex-col gap-1 rounded-xl border border-[var(--woody-accent)]/10 bg-[var(--woody-bg)] px-3 py-2.5"
                      >
                        <Link
                          to={`/posts/${encodeURIComponent(post.postId)}`}
                          className={cn(woodyFocus.ring, "text-sm font-medium text-[var(--woody-text)] hover:underline")}
                        >
                          {post.title || "Sem título"}
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--woody-muted)]">
                          <span>{post.authorUsername}</span>
                          <span>
                            {post.likesCount} gostos · {post.commentsCount} comentários
                          </span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <section className="rounded-2xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[var(--woody-text)]">Tags em posts</h2>
                <p className="mt-1 text-xs text-[var(--woody-muted)]">Frequência nos posts publicados no período.</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {dashboard.topTags.length === 0 ? (
                    <li className="text-sm text-[var(--woody-muted)]">Sem tags no período.</li>
                  ) : (
                    dashboard.topTags.map((t) => (
                      <li
                        key={t.tag}
                        className="rounded-full bg-[var(--woody-nav)]/10 px-3 py-1 text-xs font-medium text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/12"
                      >
                        #{t.tag}{" "}
                        <span className="text-[var(--woody-muted)]">({formatInt(t.count)})</span>
                      </li>
                    ))
                  )}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-[var(--woody-muted)]">{dashboard.engagement.definition}</p>
              </section>
            </div>

            <section className="rounded-2xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--woody-text)]">Impulsionamentos activos</h2>
              <p className="mt-1 text-xs text-[var(--woody-muted)]">
                Posts com destaque extra no feed e na página da comunidade (respeitando visibilidade).
              </p>
              <ul className="mt-4 space-y-2">
                {activeBoosts.length === 0 ? (
                  <li className="text-sm text-[var(--woody-muted)]">Nenhum impulsionamento activo.</li>
                ) : (
                  activeBoosts.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[var(--woody-accent)]/10 bg-[var(--woody-bg)] px-3 py-2 text-sm"
                    >
                      <Link
                        to={`/posts/${encodeURIComponent(b.postId)}`}
                        className={cn(woodyFocus.ring, "font-medium text-[var(--woody-text)] hover:underline")}
                      >
                        {b.postTitle?.trim() || `Post #${b.postId}`}
                      </Link>
                      <span className="text-xs text-[var(--woody-muted)]">
                        até {new Date(b.endsAtUtc).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <p className="text-center text-xs text-[var(--woody-muted)]">
              Total histórico de posts: {formatInt(dashboard.totalPosts)}
            </p>
          </>
        ) : null}
      </div>
    </FeedLayout>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-[var(--woody-accent)]/14 bg-[var(--woody-card)] p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--woody-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--woody-text)]">{value}</p>
      <p className="mt-1 text-xs leading-snug text-[var(--woody-muted)]">{hint}</p>
    </div>
  );
}
