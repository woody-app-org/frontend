import { api, getApiErrorMessage } from "@/lib/api";
import type { SupportTicketCategory, SupportTicketStatus } from "../lib/supportHelpers";

export interface SupportTicketAuthorSummary {
  id: string;
  username: string;
  name: string;
}

export interface SupportTicketMessage {
  id: number;
  authorRole: string;
  body: string;
  createdAt: string;
  author?: SupportTicketAuthorSummary | null;
}

export interface SupportTicketListItem {
  publicId: string;
  category: string;
  title: string;
  status: SupportTicketStatus;
  priority: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string | null;
  closedAt?: string | null;
}

export interface SupportTicketDetail {
  publicId: string;
  category: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: string;
  visibility: string;
  isBanAppeal: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  lastResponseAt?: string | null;
  messages: SupportTicketMessage[];
}

export interface PaginatedSupportTickets {
  items: SupportTicketListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListMySupportTicketsParams {
  page?: number;
  pageSize?: number;
  status?: SupportTicketStatus | "";
}

export interface CreateSupportTicketPayload {
  category: SupportTicketCategory;
  title: string;
  description: string;
  visibility?: "Private";
}

export interface ReplySupportTicketPayload {
  body: string;
}

export async function listMySupportTickets(
  params: ListMySupportTicketsParams = {}
): Promise<PaginatedSupportTickets> {
  const query: Record<string, unknown> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.status) query.status = params.status;

  const { data } = await api.get<PaginatedSupportTickets>("/support/tickets", { params: query });
  return data;
}

export async function createSupportTicket(
  payload: CreateSupportTicketPayload
): Promise<SupportTicketDetail> {
  const { data } = await api.post<SupportTicketDetail>("/support/tickets", {
    category: payload.category,
    title: payload.title.trim(),
    description: payload.description.trim(),
    visibility: payload.visibility ?? "Private",
  });
  return data;
}

export async function getMySupportTicket(publicId: string): Promise<SupportTicketDetail> {
  const { data } = await api.get<SupportTicketDetail>(`/support/tickets/${publicId}`);
  return data;
}

export async function replyToSupportTicket(
  publicId: string,
  payload: ReplySupportTicketPayload
): Promise<SupportTicketDetail> {
  const { data } = await api.post<SupportTicketDetail>(
    `/support/tickets/${publicId}/messages`,
    { body: payload.body.trim() }
  );
  return data;
}

export function getSupportErrorMessage(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback);
}
