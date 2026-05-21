import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import type {
  Community,
  CommunityMemberListItem,
  CommunityPremiumCapabilities,
  JoinRequest,
  Post,
} from "@/domain/types";
import type { CommunityMembershipStatusResult } from "@/domain/permissions";
import { cn } from "@/lib/utils";
import { woodyLayout, woodyFocus } from "@/lib/woody-ui";
import { getStoredToken } from "@/lib/api";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useCommunityPermissions } from "@/features/auth/hooks/useCommunityPermissions";
import {
  fetchAllCommunityMembers,
  fetchCommunityBySlug,
  fetchCommunityJoinRequestRows,
  fetchCommunityMembersPage,
  fetchMyCommunityMembership,
  fetchCommunityPosts,
  startCommunityPremiumUpgrade,
  CommunityPostsForbiddenError,
  CommunityJoinRequestsForbiddenError,
  type JoinRequestWithUser,
} from "../services/community.service";
import {
  cancelMyCommunityJoinRequest,
  DEFAULT_MY_COMMUNITY_JOIN_REQUEST,
  fetchMyCommunityJoinRequestStatus,
  joinCommunityPublic,
  leaveCommunity,
  requestJoinCommunity,
} from "../services/communityMembership.service";
import type {
  CommunityMembershipActionResult,
  MyCommunityJoinRequestMe,
} from "../services/communityMembership.service";
import { CommunityHero } from "../components/CommunityHero";
import { CommunityFeed } from "../components/CommunityFeed";
import { useCreatePostComposer } from "@/features/feed/context/CreatePostComposerContext";
import { CommunityAboutCard } from "../components/CommunityAboutCard";
import { CommunityTopicsCard } from "../components/CommunityTopicsCard";
import { CommunityRulesQuickCard } from "../components/CommunityRulesQuickCard";
import { CommunityMembersPreview } from "../components/CommunityMembersPreview";
import { CommunityNotFound } from "../components/CommunityNotFound";
import { CommunityEditDialog } from "../components/community-settings/CommunityEditDialog";
import { CommunityMembersManagerDialog } from "../components/members-manager/CommunityMembersManagerDialog";
import { CommunityJoinRequestsTab } from "../components/CommunityJoinRequestsTab";
import { CommunityGrowthDialog } from "../components/CommunityGrowthDialog";
import { CommunityPostBoostDialog } from "../components/CommunityPostBoostDialog";
import { CommunityPremiumSidebarCard } from "../components/CommunityPremiumSidebarCard";
import { usePostListLikeToggle } from "@/features/feed/hooks/usePostListLikeToggle";
import { showSuccessToast } from "@/lib/toast";

const COMMUNITY_FEED_PAGE_SIZE = 10;

interface CommunityDetailLoadedProps {
  community: Community;
  posts: Post[];
  previewMembers: CommunityMemberListItem[];
  managerMembers: CommunityMemberListItem[];
  viewerMembershipRole: CommunityMemberListItem["role"] | null;
  viewerIsMember: boolean;
  joinRows: JoinRequestWithUser[];
  dataRevision: number;
  onDataChanged: () => void;
  myJoin: MyCommunityJoinRequestMe;
  isAuthenticated: boolean;
  /** Feed de posts não carregado (ex. 403 em comunidade privada sem acesso). */
  postsFeedAccessDenied: boolean;
  premiumCapabilities?: CommunityPremiumCapabilities;
  togglePostLike: (postId: string) => Promise<void>;
  isPostLikePending: (postId: string) => boolean;
  /** 403 ao carregar `GET .../join-requests` (mensagem para a aba Solicitações). */
  joinRequestsForbiddenMessage: string | null;
}

function CommunityDetailLoaded({
  community,
  posts,
  previewMembers,
  managerMembers,
  viewerMembershipRole,
  viewerIsMember,
  joinRows,
  dataRevision,
  onDataChanged,
  myJoin,
  isAuthenticated,
  postsFeedAccessDenied,
  premiumCapabilities,
  togglePostLike,
  isPostLikePending,
  joinRequestsForbiddenMessage,
}: CommunityDetailLoadedProps) {
  const viewerId = useViewerId();
  const { setPageComposerCommunity } = useCreatePostComposer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [growthDialogOpen, setGrowthDialogOpen] = useState(false);
  const [upgradeBusy, setUpgradeBusy] = useState(false);
  const [boostPostId, setBoostPostId] = useState<string | null>(null);
  const [ctaBusy, setCtaBusy] = useState(false);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [feedPage, setFeedPage] = useState(1);
  const [detailTab, setDetailTab] = useState<"feed" | "join-requests">("feed");

  const isOwner = community.ownerUserId === viewerId;
  const isAdminRole = viewerMembershipRole === "admin";
  const isMember = viewerIsMember;
  const canMod = isOwner || isAdminRole;
  const showGrowthEntry = Boolean(premiumCapabilities?.isStaffForPremiumTools);

  const boostTargetPost = useMemo(() => posts.find((p) => p.id === boostPostId) ?? null, [posts, boostPostId]);

  const handleSidebarUpgrade = useCallback(async () => {
    setUpgradeBusy(true);
    setAccessNotice(null);
    try {
      await startCommunityPremiumUpgrade(community.id);
    } catch {
      setUpgradeBusy(false);
      setAccessNotice("Não foi possível iniciar o checkout do plano premium.");
    }
  }, [community.id]);

  useEffect(() => {
    if (isMember) setPageComposerCommunity(community);
    else setPageComposerCommunity(null);
    return () => setPageComposerCommunity(null);
  }, [community, isMember, setPageComposerCommunity]);

  const membershipStatus: CommunityMembershipStatusResult = isMember
    ? "active"
    : myJoin.status === "pending"
      ? "pending"
      : "none";

  const joinRequest: JoinRequest | null = useMemo(() => {
    if (isMember) return null;
    if (myJoin.status === "pending" || myJoin.status === "rejected" || myJoin.status === "cancelled") {
      return {
        id: myJoin.requestId ?? "",
        communityId: community.id,
        userId: viewerId,
        status: myJoin.status,
      };
    }
    return null;
  }, [isMember, myJoin.requestId, myJoin.status, community.id, viewerId]);

  const memberCount = community.memberCount;

  const { canEditCommunity, canManageMembers } = useCommunityPermissions(community, {
    isMember,
    membershipStatus,
    canEditCommunity: canMod,
    canManageMembers: canMod,
    isAdmin: isAdminRole,
    hasPendingJoin: myJoin.status === "pending",
  });

  const showJoinRequestsTab =
    canManageMembers && isMember && membershipStatus === "active";

  useEffect(() => {
    if (!showJoinRequestsTab && detailTab === "join-requests") {
      setDetailTab("feed");
    }
  }, [showJoinRequestsTab, detailTab]);

  const runAccess = useCallback(
    async (fn: () => Promise<CommunityMembershipActionResult>, successMessage?: string) => {
      setCtaBusy(true);
      setAccessNotice(null);
      try {
        const r = await fn();
        if (!r.ok) setAccessNotice(r.error);
        else {
          onDataChanged();
          if (successMessage) showSuccessToast(successMessage, { id: "woody-community-membership" });
        }
      } finally {
        setCtaBusy(false);
      }
    },
    [onDataChanged]
  );

  const handleCancelJoinRequest = useCallback(async () => {
    if (!window.confirm("Cancelar o pedido de entrada nesta comunidade?")) return;
    setCtaBusy(true);
    setAccessNotice(null);
    try {
      const r = await cancelMyCommunityJoinRequest(viewerId, community.slug);
      if (!r.ok) setAccessNotice(r.error);
      else {
        showSuccessToast("Pedido cancelado.", { id: "woody-community-membership" });
        onDataChanged();
      }
    } finally {
      setCtaBusy(false);
    }
  }, [community.id, onDataChanged, viewerId]);

  const handleSavedSettings = useCallback(() => {
    onDataChanged();
  }, [onDataChanged]);

  const totalPosts = posts.length;
  const feedTotalPages = Math.max(1, Math.ceil(totalPosts / COMMUNITY_FEED_PAGE_SIZE));

  useEffect(() => {
    setFeedPage(1);
  }, [community.id, dataRevision]);

  useEffect(() => {
    if (feedPage > feedTotalPages) {
      setFeedPage(Math.max(1, feedTotalPages));
    }
  }, [feedPage, feedTotalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (feedPage - 1) * COMMUNITY_FEED_PAGE_SIZE;
    return posts.slice(start, start + COMMUNITY_FEED_PAGE_SIZE);
  }, [posts, feedPage]);

  const hasNextFeedPage = feedPage < feedTotalPages;
  const hasPreviousFeedPage = feedPage > 1;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-12 pb-20 md:pb-10",
        woodyLayout.pagePadWide
      )}
    >
      <CommunityGrowthDialog
        open={growthDialogOpen}
        onOpenChange={setGrowthDialogOpen}
        communityId={community.id}
        communitySlug={community.slug}
        communityName={community.name}
        capabilities={premiumCapabilities}
      />

      <CommunityPostBoostDialog
        open={boostPostId != null}
        onOpenChange={(o) => {
          if (!o) setBoostPostId(null);
        }}
        communitySlug={community.slug}
        post={boostTargetPost}
        onApplied={onDataChanged}
      />

      <CommunityHero
        community={community}
        viewerId={viewerId}
        isMember={isMember}
        membershipStatus={membershipStatus}
        joinRequest={joinRequest}
        memberCount={memberCount}
        joinRejectionReason={myJoin.status === "rejected" ? myJoin.rejectionReason : null}
        onLeave={() =>
          runAccess(async () => {
            const r = await leaveCommunity(viewerId, community.slug);
            return r;
          }, "Saíste desta comunidade.")
        }
        onJoinPublic={() =>
          runAccess(async () => {
            const r = await joinCommunityPublic(viewerId, community.slug);
            return r;
          }, "Agora participas nesta comunidade.")
        }
        onRequestJoin={() =>
          runAccess(async () => {
            const r = await requestJoinCommunity(viewerId, community.slug);
            return r;
          }, "Solicitação enviada.")
        }
        onCancelJoinRequest={handleCancelJoinRequest}
        ctaBusy={ctaBusy}
        accessNotice={accessNotice}
        canManage={canEditCommunity}
        onManageCommunity={canEditCommunity ? () => setSettingsOpen(true) : undefined}
        canManageMembers={canManageMembers}
        onManageMembers={canManageMembers ? () => setMembersOpen(true) : undefined}
        showGrowthEntry={showGrowthEntry}
        onOpenGrowth={showGrowthEntry ? () => setGrowthDialogOpen(true) : undefined}
        adminDashboardHref={
          premiumCapabilities?.canAccessCommunityAnalytics
            ? `/communities/${encodeURIComponent(community.slug)}/admin`
            : undefined
        }
      />

      {canEditCommunity ? (
        <CommunityEditDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          community={community}
          viewerId={viewerId}
          adminRoleLabel={isOwner ? "dona" : "administradora"}
          onSaved={handleSavedSettings}
        />
      ) : null}

      {canManageMembers ? (
        <CommunityMembersManagerDialog
          open={membersOpen}
          onOpenChange={setMembersOpen}
          community={community}
          viewerId={viewerId}
          actorIsOwner={isOwner}
          listRevision={dataRevision}
          onListChanged={onDataChanged}
          liveMemberList={managerMembers}
          liveJoinRequestRows={joinRows}
        />
      ) : null}

      {showJoinRequestsTab ? (
        <nav
          className="-mt-2 flex w-full max-w-3xl flex-wrap gap-1 border-b border-[var(--woody-accent)]/12"
          aria-label="Secções da comunidade"
        >
          <button
            type="button"
            className={cn(
              woodyFocus.ring,
              "-mb-px min-h-11 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5",
              detailTab === "feed"
                ? "border-[var(--woody-nav)] text-[var(--woody-text)]"
                : "border-transparent text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
            )}
            onClick={() => setDetailTab("feed")}
          >
            Discussões
          </button>
          <button
            type="button"
            className={cn(
              woodyFocus.ring,
              "-mb-px min-h-11 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5",
              detailTab === "join-requests"
                ? "border-[var(--woody-nav)] text-[var(--woody-text)]"
                : "border-transparent text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
            )}
            onClick={() => setDetailTab("join-requests")}
          >
            Solicitações
          </button>
        </nav>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 gap-8 md:gap-10",
          "xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] xl:items-start xl:gap-x-10 xl:gap-y-8",
          "2xl:grid-cols-[minmax(28rem,1fr)_22rem] 2xl:gap-x-12"
        )}
      >
        <div className="order-2 flex min-w-0 flex-col gap-8 md:gap-10 xl:order-1">
          {detailTab === "feed" || !showJoinRequestsTab ? (
            <CommunityFeed
              community={community}
              posts={paginatedPosts}
              totalPostCount={totalPosts}
              postsPerPage={COMMUNITY_FEED_PAGE_SIZE}
              page={feedPage}
              hasNextPage={hasNextFeedPage}
              hasPreviousPage={hasPreviousFeedPage}
              onNextPage={() => setFeedPage((p) => Math.min(feedTotalPages, p + 1))}
              onPreviousPage={() => setFeedPage((p) => Math.max(1, p - 1))}
              feedAccessRestricted={postsFeedAccessDenied}
              privateGuestLock={
                community.visibility === "private" && !isMember && postsFeedAccessDenied
                  ? {
                      isAuthenticated,
                      joinStatus: myJoin.status,
                      ctaBusy,
                      loginReturnTo: `/communities/${encodeURIComponent(community.slug)}`,
                      onRequestJoin: async () => {
                        await runAccess(async () => requestJoinCommunity(viewerId, community.slug), "Solicitação enviada.");
                      },
                      onCancelJoin: handleCancelJoinRequest,
                    }
                  : null
              }
              className="min-w-0"
              premiumCapabilities={premiumCapabilities}
              onBoostPost={premiumCapabilities?.canBoostCommunityPosts ? (id) => setBoostPostId(id) : undefined}
              boostingPostId={null}
              onLike={togglePostLike}
              isLikePending={isPostLikePending}
            />
          ) : (
            <CommunityJoinRequestsTab
              communityName={community.name}
              viewerId={viewerId}
              rows={joinRows}
              listRevision={dataRevision}
              onListChanged={onDataChanged}
              forbiddenMessage={joinRequestsForbiddenMessage}
            />
          )}
        </div>

        <aside
          className={cn(
            "order-3 flex min-w-0 flex-col gap-5 md:gap-6",
            "xl:order-2 xl:self-start"
          )}
        >
          <CommunityAboutCard community={community} memberCount={memberCount} />
          <CommunityPremiumSidebarCard
            capabilities={premiumCapabilities}
            communitySlug={community.slug}
            onOpenGrowth={() => setGrowthDialogOpen(true)}
            onUpgrade={handleSidebarUpgrade}
            upgradeBusy={upgradeBusy}
          />
          <CommunityTopicsCard tags={community.tags} />
          <CommunityRulesQuickCard
            community={community}
            guestDiscovery={community.visibility === "private" && !isMember}
          />
          <CommunityMembersPreview
            communitySlug={community.slug}
            memberCount={memberCount}
            members={previewMembers}
          />
        </aside>
      </div>
    </div>
  );
}

/**
 * Miolo da página: tem de renderizar-se **dentro** de `FeedLayout` (provider do compositor).
 */
function CommunityDetailPageContent() {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const viewerId = useViewerId();
  const { isAuthenticated } = useAuth();
  const { registerCommunityRefresh } = useCreatePostComposer();
  const [revision, setRevision] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading");
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [previewMembers, setPreviewMembers] = useState<CommunityMemberListItem[]>([]);
  const [managerMembers, setManagerMembers] = useState<CommunityMemberListItem[]>([]);
  const [viewerMembershipRole, setViewerMembershipRole] = useState<CommunityMemberListItem["role"] | null>(null);
  const [viewerIsMember, setViewerIsMember] = useState(false);
  const [joinRows, setJoinRows] = useState<JoinRequestWithUser[]>([]);
  const [joinRequestsForbiddenMessage, setJoinRequestsForbiddenMessage] = useState<string | null>(null);
  const [myJoin, setMyJoin] = useState<MyCommunityJoinRequestMe>(DEFAULT_MY_COMMUNITY_JOIN_REQUEST);
  const [postsFeedAccessDenied, setPostsFeedAccessDenied] = useState(false);
  const [premiumCapabilities, setPremiumCapabilities] = useState<CommunityPremiumCapabilities | undefined>(
    undefined
  );

  const { togglePostLike, isPostLikePending } = usePostListLikeToggle(setPosts);

  const bump = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    registerCommunityRefresh(bump);
    return () => registerCommunityRefresh(null);
  }, [bump, registerCommunityRefresh]);

  useEffect(() => {
    if (!communitySlug) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const c = await fetchCommunityBySlug(communitySlug);
        if (cancelled) return;
        if (!c) {
          setCommunity(null);
          setPosts([]);
          setPreviewMembers([]);
          setManagerMembers([]);
          setViewerMembershipRole(null);
          setViewerIsMember(false);
          setJoinRows([]);
          setPostsFeedAccessDenied(false);
          setPremiumCapabilities(undefined);
          setJoinRequestsForbiddenMessage(null);
          setLoadState("ok");
          return;
        }

        const postsPromise = (async () => {
          try {
            return { posts: await fetchCommunityPosts(c.slug, viewerId, 1, 200), denied: false as const };
          } catch (e) {
            if (e instanceof CommunityPostsForbiddenError) {
              return { posts: [] as Post[], denied: true as const };
            }
            throw e;
          }
        })();

        const joinMePromise = getStoredToken()
          ? fetchMyCommunityJoinRequestStatus(c.slug)
          : Promise.resolve(null);

        const [postsResult, previewPage, myMembership, joinMeRaw] = await Promise.all([
          postsPromise,
          fetchCommunityMembersPage(c.slug, 1, 8),
          fetchMyCommunityMembership(c.slug),
          joinMePromise,
        ]);
        if (cancelled) return;

        const isOwner = c.ownerUserId === viewerId;
        const isMod = isOwner || myMembership.role === "admin" || myMembership.role === "owner";
        const fullMembers = isMod ? await fetchAllCommunityMembers(c.slug) : previewPage.items;
        let jrows: JoinRequestWithUser[] = [];
        let joinForbidden: string | null = null;
        if (isMod) {
          try {
            jrows = await fetchCommunityJoinRequestRows(c.slug);
          } catch (e) {
            if (e instanceof CommunityJoinRequestsForbiddenError) {
              joinForbidden =
                "Não tens permissão para gerir solicitações nesta comunidade. Se achas que deverias, contacta a equipa.";
            } else {
              throw e;
            }
          }
        }
        if (cancelled) return;

        setCommunity(c);
        setPosts(postsResult.posts);
        setPostsFeedAccessDenied(postsResult.denied);
        setPreviewMembers(previewPage.items);
        setManagerMembers(fullMembers);
        setViewerMembershipRole(myMembership.role);
        setViewerIsMember(myMembership.isMember);
        setJoinRows(jrows);
        setJoinRequestsForbiddenMessage(joinForbidden);
        setMyJoin(joinMeRaw ?? DEFAULT_MY_COMMUNITY_JOIN_REQUEST);
        setPremiumCapabilities(myMembership.premiumCapabilities);
        setLoadState("ok");
      } catch {
        if (!cancelled) {
          setLoadState("error");
          setCommunity(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [communitySlug, viewerId, revision]);

  if (!communitySlug) {
    return (
      <div
        className={cn(
          "mx-auto flex max-w-7xl justify-center py-10 md:py-14 pb-20 md:pb-10",
          woodyLayout.pagePadWide
        )}
      >
        <CommunityNotFound />
      </div>
    );
  }

  if (loadState === "loading") {
    return (
      <div
        className={cn(
          "mx-auto flex max-w-7xl justify-center py-16 text-sm text-[var(--woody-muted)]",
          woodyLayout.pagePadWide
        )}
      >
        A carregar comunidade…
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div
        className={cn(
          "mx-auto flex max-w-7xl justify-center py-16 text-sm text-[var(--woody-muted)]",
          woodyLayout.pagePadWide
        )}
      >
        Não foi possível carregar esta comunidade.
      </div>
    );
  }

  if (!community) {
    return (
      <div
        className={cn(
          "mx-auto flex max-w-7xl justify-center py-10 md:py-14 pb-20 md:pb-10",
          woodyLayout.pagePadWide
        )}
      >
        <CommunityNotFound />
      </div>
    );
  }

  return (
    <CommunityDetailLoaded
      key={community.id}
      community={community}
      posts={posts}
      previewMembers={previewMembers}
      managerMembers={managerMembers}
      viewerMembershipRole={viewerMembershipRole}
      viewerIsMember={viewerIsMember}
      joinRows={joinRows}
      dataRevision={revision}
      onDataChanged={bump}
      myJoin={myJoin}
      isAuthenticated={isAuthenticated}
      postsFeedAccessDenied={postsFeedAccessDenied}
      premiumCapabilities={premiumCapabilities}
      togglePostLike={togglePostLike}
      isPostLikePending={isPostLikePending}
      joinRequestsForbiddenMessage={joinRequestsForbiddenMessage}
    />
  );
}

/**
 * Detalhe da comunidade por slug (`/communities/:communitySlug`).
 */
export function CommunityDetailPage() {
  return (
    <FeedLayout showRightPanel={false}>
      <CommunityDetailPageContent />
    </FeedLayout>
  );
}
