import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import type { Community, Post } from "@/domain/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  type CreatePostModalPublication,
  resolveCreatePostPublicationFromRoute,
} from "../lib/createPostPublicationContext";

interface CreatePostComposerContextValue {
  pageComposerCommunity: Community | null;
  setPageComposerCommunity: (community: Community | null) => void;
  createPostOpen: boolean;
  /** Abre o modal com destino derivado da rota atual (perfil vs comunidade em contexto). */
  openCreatePostModal: () => void;
  setCreatePostOpen: (open: boolean) => void;
  /** Contexto fixado no último pedido de abertura (para o modal). */
  modalPublication: CreatePostModalPublication;
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
  const location = useLocation();
  const { user } = useAuth();
  const [pageComposerCommunity, setPageComposerCommunity] = useState<Community | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [modalPublication, setModalPublication] = useState<CreatePostModalPublication>({ kind: "profile" });
  const feedIngestRef = useRef<((post: Post) => void) | null>(null);
  const communityRefreshRef = useRef<(() => void) | null>(null);

  const registerFeedIngest = useCallback((fn: ((post: Post) => void) | null) => {
    feedIngestRef.current = fn;
  }, []);

  const registerCommunityRefresh = useCallback((fn: (() => void) | null) => {
    communityRefreshRef.current = fn;
  }, []);

  const openCreatePostModal = useCallback(() => {
    const next = resolveCreatePostPublicationFromRoute(location.pathname, {
      pageComposerCommunity,
      viewerUserId: user?.id,
    });
    setModalPublication(next);
    setCreatePostOpen(true);
  }, [location.pathname, pageComposerCommunity, user?.id]);

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
      modalPublication,
      registerFeedIngest,
      registerCommunityRefresh,
      runAfterPostCreated,
    }),
    [
      createPostOpen,
      modalPublication,
      openCreatePostModal,
      pageComposerCommunity,
      registerFeedIngest,
      registerCommunityRefresh,
      runAfterPostCreated,
    ]
  );

  return (
    <CreatePostComposerContext.Provider value={value}>{children}</CreatePostComposerContext.Provider>
  );
}

/** Hook do contexto do compositor (ficheiro partilhado com o provider para HMR). */
// eslint-disable-next-line react-refresh/only-export-components -- hook acoplado ao provider
export function useCreatePostComposer(): CreatePostComposerContextValue {
  const ctx = useContext(CreatePostComposerContext);
  if (!ctx) {
    throw new Error("useCreatePostComposer deve ser usado dentro de CreatePostComposerProvider.");
  }
  return ctx;
}

export type { CreatePostModalPublication } from "../lib/createPostPublicationContext";
