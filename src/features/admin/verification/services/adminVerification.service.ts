import { api } from "@/lib/api";
import type { VerificationStatus } from "@/features/auth/types";

// ─── DTOs ───────────────────────────────────────────────────────────────────

export interface AdminVerificationListItemDto {
  verificationId: number;
  userId: number;
  username: string;
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
  status: VerificationStatus;
  documentSubmittedAt?: string | null;
  attemptCount: number;
  reviewedAt?: string | null;
  rejectionReasonSummary?: string | null;
}

export interface AdminVerificationDetailDto {
  verificationId: number;
  userId: number;
  username: string;
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
  status: VerificationStatus;
  hasDocument: boolean;
  documentUrls: string[];
  documentSubmittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedByUserId?: number | null;
  rejectionReason?: string | null;
  attemptCount: number;
  consentGivenAt?: string | null;
  createdAt: string;
  updatedAt: string;
  decisionLog?: string | null;
}

export interface AdminVerificationListResponse {
  items: AdminVerificationListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListVerificationFilters {
  status?: VerificationStatus | "";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// ─── Service functions ───────────────────────────────────────────────────────

export async function listVerificationRequests(
  filters: ListVerificationFilters = {}
): Promise<AdminVerificationListResponse> {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  };
  if (filters.status) params.status = filters.status;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const { data } = await api.get<AdminVerificationListResponse>("/admin/verification", {
    params,
  });
  return data;
}

export async function getVerificationRequest(id: number): Promise<AdminVerificationDetailDto> {
  const { data } = await api.get<AdminVerificationDetailDto>(`/admin/verification/${id}`);
  return data;
}

/**
 * Retorna uma das fotos de verificação (1 a 3) como Blob para uso seguro via `URL.createObjectURL`.
 * Nunca expõe o JWT na URL pública.
 */
export async function fetchVerificationDocumentBlob(id: number, index: number): Promise<Blob> {
  const { data } = await api.get(`/admin/verification/${id}/document/${index}`, {
    responseType: "blob",
  });
  return data as Blob;
}

export async function approveVerification(id: number): Promise<AdminVerificationDetailDto> {
  const { data } = await api.post<AdminVerificationDetailDto>(
    `/admin/verification/${id}/approve`
  );
  return data;
}

export async function rejectVerification(
  id: number,
  rejectionReason: string
): Promise<AdminVerificationDetailDto> {
  const { data } = await api.post<AdminVerificationDetailDto>(
    `/admin/verification/${id}/reject`,
    { rejectionReason }
  );
  return data;
}
