import axios from "axios";
import type { UserProfile, ProfilePostsResponse, ProfileUpdatePayload } from "../types";
import { applyUserDisplayPatch } from "@/domain/mocks/userDisplayPatchStore";
import { getAuthUser } from "@/features/auth/services/auth.service";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapPostFromApi, mapUserProfileFromApi } from "@/lib/apiMappers";

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
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}`);
    return mapUserProfileFromApi(data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw new Error(getApiErrorMessage(e, "Falha ao carregar perfil."));
  }
}

export type UpdateProfileResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string };

export async function updateProfile(userId: string, payload: ProfileUpdatePayload): Promise<UpdateProfileResult> {
  const validated = validateProfileUpdatePayload(payload);
  if (!validated.ok) return validated;

  const session = getAuthUser();
  if (!session || session.id !== userId) {
    return { ok: false, error: "Só pode editar o seu próprio perfil." };
  }

  try {
    const { data } = await api.patch("/users/me", {
      name: payload.name!.trim(),
      username: payload.username!.trim(),
      bio: (payload.bio ?? "").trim(),
      pronouns: payload.pronouns?.trim() || undefined,
      location: payload.location?.trim() || undefined,
      role: payload.role?.trim() || undefined,
      avatarUrl: payload.avatarUrl,
      bannerUrl: payload.bannerUrl,
      interests: payload.interests?.map((i) => ({ id: i.id, label: i.label.trim() })),
    });
    const next = mapUserProfileFromApi(data);
    applyUserDisplayPatch(userId, {
      name: next.name,
      username: next.username,
      avatarUrl: next.avatarUrl,
      bio: next.bio,
      pronouns: next.pronouns,
    });
    return { ok: true, profile: next };
  } catch (e) {
    return { ok: false, error: getApiErrorMessage(e, "Falha ao guardar perfil.") };
  }
}

export async function getProfilePosts(
  userId: string,
  page: number,
  pageSize: number = 10,
  viewerId: string
): Promise<ProfilePostsResponse> {
  try {
    const { data } = await api.get(`/users/${encodeURIComponent(userId)}/posts`, {
      params: { page, pageSize },
    });
    const raw = data as Record<string, unknown>;
    const pinned = Array.isArray(raw.pinned)
      ? (raw.pinned as unknown[]).map((p) => mapPostFromApi(p as Record<string, unknown>, viewerId))
      : [];
    const items = Array.isArray(raw.items)
      ? (raw.items as unknown[]).map((p) => mapPostFromApi(p as Record<string, unknown>, viewerId))
      : [];
    const unpinnedTotalCount =
      typeof raw.unpinnedTotalCount === "number"
        ? raw.unpinnedTotalCount
        : typeof raw.unpinnedTotalCount === "string"
          ? Number.parseInt(raw.unpinnedTotalCount, 10)
          : items.length;
    return {
      pinned,
      items,
      page: typeof raw.page === "number" ? raw.page : Number(raw.page ?? page),
      pageSize: typeof raw.pageSize === "number" ? raw.pageSize : Number(raw.pageSize ?? pageSize),
      totalCount: typeof raw.totalCount === "number" ? raw.totalCount : Number(raw.totalCount ?? pinned.length + items.length),
      unpinnedTotalCount: Number.isFinite(unpinnedTotalCount) ? unpinnedTotalCount : items.length,
      hasNextPage: Boolean(raw.hasNextPage),
      hasPreviousPage: Boolean(raw.hasPreviousPage),
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar posts do perfil."));
  }
}
