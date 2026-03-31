import type { Community } from "../types";

const draftsByCommunityId = new Map<string, Community>();

let draftVersion = 0;
const listeners = new Set<() => void>();

function notifyDraftListeners(): void {
  draftVersion += 1;
  listeners.forEach((fn) => fn());
}

/** Para `useSyncExternalStore`: listas memoizadas reagem a novas edições locais. */
export function subscribeCommunityDrafts(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getCommunityDraftsVersion(): number {
  return draftVersion;
}

/**
 * Rascunho pós-edição de comunidade (mock). `getCommunityById` / `getCommunityBySlug` fazem o merge.
 * Futuro: invalidação via API ou canal em tempo real.
 */
export function setCommunityDraft(communityId: string, community: Community): void {
  draftsByCommunityId.set(communityId, {
    ...community,
    tags: [...community.tags],
  });
  notifyDraftListeners();
}

export function getCommunityDraft(communityId: string): Community | undefined {
  const d = draftsByCommunityId.get(communityId);
  return d ? { ...d, tags: [...d.tags] } : undefined;
}
