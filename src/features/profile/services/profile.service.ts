import type { UserProfile, ProfilePostsResponse, ProfileUpdatePayload } from "../types";
import { MOCK_USER_PROFILE } from "../mocks/profile.mock";
import { getPostsByAuthorId, getUserById } from "@/domain/selectors";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneProfile(p: UserProfile): UserProfile {
  return {
    ...p,
    socialLinks: p.socialLinks.map((s) => ({ ...s })),
    interests: p.interests.map((i) => ({ ...i })),
    suggestions: p.suggestions.map((s) => ({ ...s })),
  };
}

function profileFromSeedUser(userId: string): UserProfile | null {
  const u = getUserById(userId);
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
    pronouns: u.pronouns,
    bannerUrl: null,
    bio: u.bio ?? "",
    location: undefined,
    role: undefined,
    socialLinks: [],
    interests: [],
    suggestions: [],
  };
}

function getStaticBaseProfile(userId: string): UserProfile | null {
  if (MOCK_USER_PROFILE.id === userId) return cloneProfile(MOCK_USER_PROFILE);
  const fromSeed = profileFromSeedUser(userId);
  return fromSeed ? cloneProfile(fromSeed) : null;
}

/** Rascunhos locais pós-edição (substituído depois por resposta da API). */
const profileDraftByUserId = new Map<string, UserProfile>();

function getResolvedProfile(userId: string): UserProfile | null {
  const base = getStaticBaseProfile(userId);
  if (!base) return null;
  const draft = profileDraftByUserId.get(userId);
  if (!draft) return base;
  return {
    ...draft,
    socialLinks: draft.socialLinks.map((s) => ({ ...s })),
    interests: draft.interests.map((i) => ({ ...i })),
    suggestions: draft.suggestions.map((s) => ({ ...s })),
  };
}

export function validateProfileUpdatePayload(payload: ProfileUpdatePayload): { ok: true } | { ok: false; error: string } {
  const name = payload.name?.trim() ?? "";
  if (name.length < 1) return { ok: false, error: "Informe um nome de exibição." };
  if (name.length > 80) return { ok: false, error: "Nome muito longo (máx. 80 caracteres)." };

  const usernameRaw = (payload.username ?? "").trim().toLowerCase();
  if (usernameRaw.length < 3) return { ok: false, error: "Nome de usuário muito curto (mín. 3 caracteres)." };
  if (usernameRaw.length > 30) return { ok: false, error: "Nome de usuário muito longo." };
  if (!/^[a-z0-9._]+$/.test(usernameRaw)) {
    return { ok: false, error: "Use apenas letras minúsculas, números, ponto e sublinhado." };
  }

  const bio = payload.bio ?? "";
  if (bio.length > 500) return { ok: false, error: "Bio muito longa (máx. 500 caracteres)." };

  const pronouns = payload.pronouns?.trim() ?? "";
  if (pronouns.length > 40) return { ok: false, error: "Pronomes muito longos." };

  const location = payload.location?.trim() ?? "";
  if (location.length > 60) return { ok: false, error: "Localização muito longa." };

  const role = payload.role?.trim() ?? "";
  if (role.length > 60) return { ok: false, error: "Título ou profissão muito longos." };

  const interestList = (payload.interests ?? []).map((t) => ({ ...t, label: t.label.trim() })).filter((t) => t.label.length > 0);
  if (interestList.length > 24) {
    return { ok: false, error: "Muitos interesses (máx. 24)." };
  }
  for (const t of interestList) {
    if (t.label.length > 48) return { ok: false, error: "Um dos interesses é muito longo." };
  }

  return { ok: true };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  await delay(350);
  return getResolvedProfile(userId);
}

export type UpdateProfileResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string };

/**
 * Persistência mock: grava sobre o rascunho em memória.
 * Futuro: `PUT /users/:id/profile` ou equivalente.
 */
export async function updateProfile(userId: string, payload: ProfileUpdatePayload): Promise<UpdateProfileResult> {
  await delay(550);
  const validated = validateProfileUpdatePayload(payload);
  if (!validated.ok) return validated;

  const current = getResolvedProfile(userId);
  if (!current) return { ok: false, error: "Perfil não encontrado." };

  const username = payload.username!.trim().toLowerCase();
  const cleanedInterests =
    payload.interests !== undefined
      ? payload.interests
          .map((i) => ({ ...i, label: i.label.trim() }))
          .filter((i) => i.label.length > 0)
      : current.interests;

  const next: UserProfile = {
    ...current,
    name: payload.name!.trim(),
    username,
    bio: (payload.bio ?? "").trim(),
    pronouns: payload.pronouns?.trim() || undefined,
    location: payload.location?.trim() || undefined,
    role: payload.role?.trim() || undefined,
    avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : current.avatarUrl,
    bannerUrl: payload.bannerUrl !== undefined ? payload.bannerUrl : current.bannerUrl,
    interests: cleanedInterests.map((i) => ({ ...i })),
  };

  profileDraftByUserId.set(userId, next);
  return { ok: true, profile: next };
}

/**
 * Busca posts da usuária (todas as comunidades em que publicou), com paginação em cima do seed único.
 */
export async function getProfilePosts(
  userId: string,
  page: number,
  pageSize: number = 10
): Promise<ProfilePostsResponse> {
  await delay(400);
  const pool = getPostsByAuthorId(userId);
  const totalCount = pool.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = pool.slice(start, end);

  return {
    items,
    page,
    pageSize,
    totalCount,
    hasNextPage: end < totalCount,
    hasPreviousPage: page > 1,
  };
}
