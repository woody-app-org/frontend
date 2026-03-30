import { canEditCommunity } from "@/domain/permissions";
import { setCommunityDraft } from "@/domain/mocks/communityDraftStore";
import { getActiveMemberCountForCommunity, getCommunityById, getCommunityBySlug } from "@/domain/selectors";
import type { Community } from "@/domain/types";
import type { CommunityUpdatePayload, CommunityUpdateResult } from "../types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneCommunity(c: Community): Community {
  return { ...c, tags: [...c.tags] };
}

function withLiveMemberCount(c: Community): Community {
  return {
    ...c,
    memberCount: getActiveMemberCountForCommunity(c.id),
  };
}

export function getCommunityResolvedBySlug(slug: string): Community | undefined {
  const base = getCommunityBySlug(slug);
  if (!base) return undefined;
  return withLiveMemberCount(cloneCommunity(base));
}

export function getCommunityResolvedById(id: string): Community | undefined {
  const base = getCommunityById(id);
  if (!base) return undefined;
  return withLiveMemberCount(cloneCommunity(base));
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const s = t.trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

export function validateCommunityUpdatePayload(
  payload: CommunityUpdatePayload
): { ok: true } | { ok: false; error: string } {
  const name = payload.name.trim();
  if (name.length < 2) return { ok: false, error: "Informe um nome com pelo menos 2 caracteres." };
  if (name.length > 80) return { ok: false, error: "Nome da comunidade muito longo." };

  const description = payload.description.trim();
  if (description.length < 10) return { ok: false, error: "A descrição precisa de pelo menos 10 caracteres." };
  if (description.length > 2_000) return { ok: false, error: "Descrição muito longa (máx. 2000 caracteres)." };

  const tagsNorm = normalizeTags(payload.tags);
  if (tagsNorm.length > 12) return { ok: false, error: "Muitas tags (máx. 12)." };
  for (const t of tagsNorm) {
    if (t.length > 40) return { ok: false, error: "Uma das tags é muito longa." };
  }

  if (payload.rules.trim().length > 4_000) {
    return { ok: false, error: "Regras muito longas (máx. 4000 caracteres)." };
  }

  return { ok: true };
}

/**
 * Atualização mock com rascunho em memória. Quem pode editar segue `canEditCommunity` (dona ou admin).
 * Integração HTTP: `BACKEND_ROUTE_HINTS.community.updateCommunity` em `@/lib/backendIntegrationHints`.
 */
export async function updateCommunity(
  actorUserId: string,
  communityId: string,
  payload: CommunityUpdatePayload
): Promise<CommunityUpdateResult> {
  await delay(520);
  const current = getCommunityById(communityId);
  if (!current) return { ok: false, error: "Comunidade não encontrada." };

  if (!canEditCommunity(actorUserId, current)) {
    return { ok: false, error: "Você não tem permissão para editar esta comunidade." };
  }

  const validated = validateCommunityUpdatePayload(payload);
  if (!validated.ok) return validated;

  const tags = normalizeTags(payload.tags);
  const next: Community = {
    ...current,
    name: payload.name.trim(),
    description: payload.description.trim(),
    category: payload.category,
    tags,
    rules: payload.rules.trim(),
    avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : current.avatarUrl,
    coverUrl: payload.coverUrl !== undefined ? payload.coverUrl : current.coverUrl,
    visibility: payload.visibility,
    id: current.id,
    slug: current.slug,
    ownerUserId: current.ownerUserId,
    memberCount: getActiveMemberCountForCommunity(current.id),
  };

  setCommunityDraft(communityId, next);
  return { ok: true, community: cloneCommunity(next) };
}
