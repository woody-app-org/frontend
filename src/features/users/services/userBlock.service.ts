/**
 * Bloqueio privado de utilizadoras (alinhado a `UsersController` no backend).
 */
import type { User } from "@/domain/types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapUserFromApi } from "@/lib/apiMappers";

export interface PaginatedBlockedUsersResult {
  items: User[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

function mapPaginatedUsers(data: unknown): PaginatedBlockedUsersResult {
  const raw = asRecord(data);
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  return {
    items: rawItems.map((u) => mapUserFromApi(asRecord(u))),
    page: Number(raw.page ?? 1),
    pageSize: Number(raw.pageSize ?? rawItems.length),
    totalCount: Number(raw.totalCount ?? rawItems.length),
    hasNextPage: Boolean(raw.hasNextPage),
    hasPreviousPage: Boolean(raw.hasPreviousPage),
  };
}

const pageSizeClamp = (n: number) => Math.min(50, Math.max(1, Math.floor(n)));

/** `POST /users/:userId/block` */
export async function blockUser(userId: number | string): Promise<void> {
  try {
    await api.post(`/users/${encodeURIComponent(String(userId))}/block`);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível bloquear esta usuária."));
  }
}

/** `DELETE /users/:userId/block` */
export async function unblockUser(userId: number | string): Promise<void> {
  try {
    await api.delete(`/users/${encodeURIComponent(String(userId))}/block`);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível desbloquear esta usuária."));
  }
}

/** `GET /users/me/blocked-users` */
export async function fetchBlockedUsersPage(
  page: number,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedBlockedUsersResult> {
  try {
    const trimmed = search?.trim();
    const { data } = await api.get("/users/me/blocked-users", {
      params: {
        page,
        pageSize: pageSizeClamp(pageSize),
        ...(trimmed ? { search: trimmed } : {}),
      },
    });
    return mapPaginatedUsers(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Falha ao carregar usuárias bloqueadas."));
  }
}
