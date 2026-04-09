import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Community, Post } from "@/domain/types";

interface CreatePostComposerContextValue {
  pageComposerCommunity: Community | null;
  setPageComposerCommunity: (community: Community | null) => void;
  createPostOpen: boolean;
  openCreatePostModal: () => void;
  setCreatePostOpen: (open: boolean) => void;
  registerFeedIngest: (fn: ((post: Post) => void) | null) => void;
  registerCommunityRefresh: (fn: (() => void) | null) => void;
  /** Chamado após POST bem-sucedido (modal usa `location.pathname`). */
  runAfterPostCreated: (post: Post, pathname: string) => void;
}

const CreatePostComposerContext = createContext<CreatePostComposerContextValue | null>(null);

function pathWithoutQuery(path: string): string {
  const i = path.indexOf("?");
  return i === -1 ? path : path.slice(0, i);
}

const COMMUNITY_DETAIL_PATH = /^\/communities\/[^/]+\/?$/;

export function CreatePostComposerProvider({ children }: { children: ReactNode }) {
  const [pageComposerCommunity, setPageComposerCommunity] = useState<Community | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const feedIngestRef = useRef<((post: Post) => void) | null>(null);
  const communityRefreshRef = useRef<(() => void) | null>(null);

  const registerFeedIngest = useCallback((fn: ((post: Post) => void) | null) => {
    feedIngestRef.current = fn;
  }, []);

  const registerCommunityRefresh = useCallback((fn: (() => void) | null) => {
    communityRefreshRef.current = fn;
  }, []);

  const openCreatePostModal = useCallback(() => setCreatePostOpen(true), []);

  const runAfterPostCreated = useCallback((post: Post, pathname: string) => {
    const p = pathWithoutQuery(pathname);
    if (p === "/feed") {
      feedIngestRef.current?.(post);
    }
    if (COMMUNITY_DETAIL_PATH.test(p)) {
      communityRefreshRef.current?.();
    }
  }, []);

  const value = useMemo(
    () => ({
      pageComposerCommunity,
      setPageComposerCommunity,
      createPostOpen,
      openCreatePostModal,
      setCreatePostOpen,
      registerFeedIngest,
      registerCommunityRefresh,
      runAfterPostCreated,
    }),
    [
      createPostOpen,
      pageComposerCommunity,
      openCreatePostModal,
      registerFeedIngest,
      registerCommunityRefresh,
      runAfterPostCreated,
    ]
  );

  return (
    <CreatePostComposerContext.Provider value={value}>{children}</CreatePostComposerContext.Provider>
  );
}

export function useCreatePostComposer(): CreatePostComposerContextValue {
  const ctx = useContext(CreatePostComposerContext);
  if (!ctx) {
    throw new Error("useCreatePostComposer deve ser usado dentro de CreatePostComposerProvider.");
  }
  return ctx;
}
