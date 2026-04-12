import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import type { Community, CommunityMemberListItem, JoinRequest, Post } from "@/domain/types";
import { cn } from "@/lib/utils";
import { woodyLayout } from "@/lib/woody-ui";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useCommunityPermissions } from "@/features/auth/hooks/useCommunityPermissions";
import {
  fetchAllCommunityMembers,
  fetchCommunityBySlug,
  fetchCommunityJoinRequestRows,
  fetchCommunityMembersPage,
  fetchMyCommunityMembership,
  fetchCommunityPosts,
  CommunityPostsForbiddenError,
  type JoinRequestWithUser,
} from "../services/community.service";
import {
  joinCommunityPublic,
  leaveCommunity,
  requestJoinCommunity,
} from "../services/communityMembership.service";
import type { CommunityMembershipActionResult } from "../services/communityMembership.service";
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
  joinPending: boolean;
  setJoinPending: (v: boolean) => void;
  /** Feed de posts não carregado (ex. 403 em comunidade privada sem acesso). */
  postsFeedAccessDenied: boolean;
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
  joinPending,
  setJoinPending,
  postsFeedAccessDenied,
}: CommunityDetailLoadedProps) {
  const viewerId = useViewerId();
  const { setPageComposerCommunity } = useCreatePostComposer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [ctaBusy, setCtaBusy] = useState(false);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [feedPage, setFeedPage] = useState(1);

  const isOwner = community.ownerUserId === viewerId;
  const isAdminRole = viewerMembershipRole === "admin";
  const isMember = viewerIsMember;
  const canMod = isOwner || isAdminRole;

  useEffect(() => {
    if (isMember) setPageComposerCommunity(community);
    else setPageComposerCommunity(null);
    return () => setPageComposerCommunity(null);
  }, [community, isMember, setPageComposerCommunity]);

  const membershipStatus = joinPending && !isMember ? "pending" : isMember ? "active" : "none";

  const joinRequest: JoinRequest | null = useMemo(() => {
    if (!joinPending || isMember) return null;
    return {
      id: "pending-local",
      communityId: community.id,
      userId: viewerId,
      status: "pending",
    };
  }, [joinPending, isMember, community.id, viewerId]);

  const memberCount = community.memberCount;

  const { canEditCommunity, canManageMembers } = useCommunityPermissions(community, {
    isMember,
    membershipStatus,
    canEditCommunity: canMod,
    canManageMembers: canMod,
    isAdmin: isAdminRole,
    hasPendingJoin: joinPending,
  });

  const runAccess = useCallback(
    async (fn: () => Promise<CommunityMembershipActionResult>) => {
      setCtaBusy(true);
      setAccessNotice(null);
      try {
        const r = await fn();
        if (!r.ok) setAccessNotice(r.error);
        else onDataChanged();
      } finally {
        setCtaBusy(false);
      }
    },
    [onDataChanged]
  );

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
      <CommunityHero
        community={community}
        viewerId={viewerId}
        isMember={isMember}
        membershipStatus={membershipStatus}
        joinRequest={joinRequest}
        memberCount={memberCount}
        onLeave={() =>
          runAccess(async () => {
            const r = await leaveCommunity(viewerId, community.id);
            if (r.ok) setJoinPending(false);
            return r;
          })
        }
        onJoinPublic={() =>
          runAccess(async () => {
            const r = await joinCommunityPublic(viewerId, community.id);
            if (r.ok) setJoinPending(false);
            return r;
          })
        }
        onRequestJoin={() =>
          runAccess(async () => {
            const r = await requestJoinCommunity(viewerId, community.id);
            if (r.ok) setJoinPending(true);
            return r;
          })
        }
        ctaBusy={ctaBusy}
        accessNotice={accessNotice}
        canManage={canEditCommunity}
        onManageCommunity={canEditCommunity ? () => setSettingsOpen(true) : undefined}
        canManageMembers={canManageMembers}
        onManageMembers={canManageMembers ? () => setMembersOpen(true) : undefined}
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

      <div
        className={cn(
          "grid grid-cols-1 gap-8 md:gap-10",
          "xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] xl:items-start xl:gap-x-10 xl:gap-y-8",
          "2xl:grid-cols-[minmax(28rem,1fr)_22rem] 2xl:gap-x-12"
        )}
      >
        <div className="order-2 flex min-w-0 flex-col gap-8 md:gap-10 xl:order-1">
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
            className="min-w-0"
          />
        </div>

        <aside
          className={cn(
            "order-3 flex min-w-0 flex-col gap-5 md:gap-6",
            "xl:order-2 xl:self-start"
          )}
        >
          <CommunityAboutCard community={community} memberCount={memberCount} />
          <CommunityTopicsCard tags={community.tags} />
          <CommunityRulesQuickCard community={community} />
          <CommunityMembersPreview
            communityId={community.id}
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
  const [joinPending, setJoinPending] = useState(false);
  const [postsFeedAccessDenied, setPostsFeedAccessDenied] = useState(false);

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
          setLoadState("ok");
          return;
        }

        const postsPromise = (async () => {
          try {
            return { posts: await fetchCommunityPosts(c.id, viewerId, 1, 200), denied: false as const };
          } catch (e) {
            if (e instanceof CommunityPostsForbiddenError) {
              return { posts: [] as Post[], denied: true as const };
            }
            throw e;
          }
        })();

        const [postsResult, previewPage, myMembership] = await Promise.all([
          postsPromise,
          fetchCommunityMembersPage(c.id, 1, 8),
          fetchMyCommunityMembership(c.id),
        ]);
        if (cancelled) return;

        const isOwner = c.ownerUserId === viewerId;
        const isMod = isOwner || myMembership.role === "admin" || myMembership.role === "owner";
        const fullMembers = isMod ? await fetchAllCommunityMembers(c.id) : previewPage.items;
        const jrows = isMod ? await fetchCommunityJoinRequestRows(c.id) : [];
        if (cancelled) return;

        setCommunity(c);
        setPosts(postsResult.posts);
        setPostsFeedAccessDenied(postsResult.denied);
        setPreviewMembers(previewPage.items);
        setManagerMembers(fullMembers);
        setViewerMembershipRole(myMembership.role);
        setViewerIsMember(myMembership.isMember);
        setJoinRows(jrows);
        if (myMembership.isMember) setJoinPending(false);
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
          "mx-auto flex max-w-6xl justify-center py-10 md:py-14 pb-20 md:pb-10",
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
          "mx-auto flex max-w-6xl justify-center py-16 text-sm text-[var(--woody-muted)]",
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
          "mx-auto flex max-w-6xl justify-center py-16 text-sm text-[var(--woody-muted)]",
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
          "mx-auto flex max-w-6xl justify-center py-10 md:py-14 pb-20 md:pb-10",
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
      joinPending={joinPending}
      setJoinPending={setJoinPending}
      postsFeedAccessDenied={postsFeedAccessDenied}
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
