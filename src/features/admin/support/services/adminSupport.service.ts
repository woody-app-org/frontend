import { api, getApiErrorMessage } from "@/lib/api";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/support/lib/supportHelpers";
import type { SupportTicketAuthorSummary } from "@/features/support/services/support.service";

export interface AdminSupportAuthor {
  userId?: string | null;
  username?: string | null;
  displayName?: string | null;
  emailMasked?: string | null;
}

export interface AdminSupportTicketListItem {
  publicId: string;
  category: string;
  title: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  visibility: string;
  isBanAppeal: boolean;
  author?: AdminSupportAuthor | null;
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string | null;
  closedAt?: string | null;
}

export interface AdminSupportTicketMessage {
  id: number;
  authorRole: string;
  body: string;
  isInternalNote: boolean;
  createdAt: string;
  author?: SupportTicketAuthorSummary | null;
}

export interface AdminSupportAssignee {
  id: string;
  username: string;
  displayName?: string | null;
}

export interface AdminSupportTicketDetail {
  publicId: string;
  category: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  visibility: string;
  isBanAppeal: boolean;
  author?: AdminSupportAuthor | null;
  assignedTo?: AdminSupportAssignee | null;
  relatedReportId?: number | null;
  relatedUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  lastResponseAt?: string | null;
  messages: AdminSupportTicketMessage[];
}

export interface AdminSupportListResponse {
  items: AdminSupportTicketListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListAdminSupportTicketsParams {
  page?: number;
  pageSize?: number;
  status?: SupportTicketStatus | "";
  category?: SupportTicketCategory | "";
  priority?: SupportTicketPriority | "";
  visibility?: string;
  isBanAppeal?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateAdminSupportTicketPayload {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
}

export interface AdminSupportReplyPayload {
  body: string;
  isInternalNote: boolean;
}

export async function listAdminSupportTickets(
  params: ListAdminSupportTicketsParams = {}
): Promise<AdminSupportListResponse> {
  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.status) query.status = params.status;
  if (params.category) query.category = params.category;
  if (params.priority) query.priority = params.priority;
  if (params.visibility) query.visibility = params.visibility;
  if (params.isBanAppeal != null) query.isBanAppeal = params.isBanAppeal;
  if (params.search) query.search = params.search;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  const { data } = await api.get<AdminSupportListResponse>("/admin/support/tickets", {
    params: query,
  });
  return data;
}

export async function getAdminSupportTicket(
  publicId: string
): Promise<AdminSupportTicketDetail> {
  const { data } = await api.get<AdminSupportTicketDetail>(
    `/admin/support/tickets/${publicId}`
  );
  return data;
}

export async function updateAdminSupportTicket(
  publicId: string,
  payload: UpdateAdminSupportTicketPayload
): Promise<AdminSupportTicketDetail> {
  const { data } = await api.patch<AdminSupportTicketDetail>(
    `/admin/support/tickets/${publicId}`,
    payload
  );
  return data;
}

export async function replyAdminSupportTicket(
  publicId: string,
  payload: AdminSupportReplyPayload
): Promise<AdminSupportTicketDetail> {
  const { data } = await api.post<AdminSupportTicketDetail>(
    `/admin/support/tickets/${publicId}/messages`,
    {
      body: payload.body.trim(),
      isInternalNote: payload.isInternalNote,
    }
  );
  return data;
}

export function getAdminSupportErrorMessage(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback);
}
