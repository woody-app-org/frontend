import axios from "axios";
import type { User } from "@/domain/types";
import { api, getApiErrorMessage, getMessageFromApiResponseData } from "@/lib/api";
import { mapUserFromApi } from "@/lib/apiMappers";

export type ProfileSignalType =
  | "te_notei"
  | "olhadinha"
  | "conhecer_mais"
  | "quero_conversar"
  | "crush_fofo"
  | "atracao"
  | "sinal_verde"
  | "cheguei";

export interface ProfileSignalOption {
  type: ProfileSignalType;
  label: string;
  hint: string;
}

export const PROFILE_SIGNAL_OPTIONS: ProfileSignalOption[] = [
  { type: "te_notei", label: "Te notei 👀", hint: "Leve e curioso" },
  { type: "olhadinha", label: "Olhadinha 😉", hint: "Um flerte sutil" },
  { type: "conhecer_mais", label: "Conhecer mais 🍷", hint: "Abrir espaço" },
  { type: "quero_conversar", label: "Quero conversar ✨", hint: "Puxar assunto" },
  { type: "crush_fofo", label: "Crush fofo 🐻", hint: "Doce e direto" },
  { type: "atracao", label: "Atração 🔥", hint: "Mais intenso" },
  { type: "sinal_verde", label: "Sinal verde ✅", hint: "Pode chegar" },
  { type: "cheguei", label: "Cheguei 😏", hint: "Com atitude" },
];

export interface ProfileSignal {
  id: number;
  type: ProfileSignalType;
  label: string;
  emoji: string;
  status: "sent" | "read" | "archived" | "dismissed" | string;
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
  dismissedAt: string | null;
  sender: User;
  receiver: User;
  recipient: User;
}

export type ProfileSignalRestrictionCode =
  | "cooldown"
  | "blocked"
  | "receiver_unavailable"
  | "social_mismatch"
  | string;

export interface ProfileSignalStatus {
  recipientUserId: number;
  canSend: boolean;
  lastSentAt: string | null;
  nextAllowedAt: string | null;
  /** Motivo quando não é possível enviar (inclui cooldown por tipo). */
  restrictionCode: ProfileSignalRestrictionCode | null;
  /** Falso se bloqueio ou preferência da destinatária impedem (independente do tipo). */
  senderEligible: boolean;
  eligibilityRestrictionCode: ProfileSignalRestrictionCode | null;
}

export interface ProfileSignalsPage {
  items: ProfileSignal[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

function mapSignalType(raw: unknown): ProfileSignalType {
  const value = String(raw ?? "te_notei");
  return PROFILE_SIGNAL_OPTIONS.some((option) => option.type === value)
    ? (value as ProfileSignalType)
    : "te_notei";
}

function mapProfileSignal(data: unknown): ProfileSignal {
  const raw = asRecord(data);
  return {
    id: Number(raw.id ?? 0),
    type: mapSignalType(raw.type),
    label: String(raw.label ?? ""),
    emoji: String(raw.emoji ?? ""),
    status: String(raw.status ?? "sent"),
    createdAt: String(raw.createdAt ?? ""),
    readAt: raw.readAt == null ? null : String(raw.readAt),
    archivedAt: raw.archivedAt == null ? null : String(raw.archivedAt),
    dismissedAt: raw.dismissedAt == null ? null : String(raw.dismissedAt),
    sender: mapUserFromApi(asRecord(raw.sender)),
    receiver: mapUserFromApi(asRecord(raw.receiver ?? raw.recipient)),
    recipient: mapUserFromApi(asRecord(raw.recipient ?? raw.receiver)),
  };
}

function mapSignalsPage(data: unknown): ProfileSignalsPage {
  const raw = asRecord(data);
  const items = Array.isArray(raw.items) ? raw.items.map(mapProfileSignal) : [];
  return {
    items,
    page: Number(raw.page ?? 1),
    pageSize: Number(raw.pageSize ?? items.length),
    totalCount: Number(raw.totalCount ?? items.length),
    hasNextPage: Boolean(raw.hasNextPage),
    hasPreviousPage: Boolean(raw.hasPreviousPage),
  };
}

export async function fetchProfileSignalStatus(recipientUserId: number): Promise<ProfileSignalStatus> {
  try {
    const { data } = await api.get("/profile-signals/status", { params: { receiverUserId: recipientUserId } });
    const raw = asRecord(data);
    const restriction =
      raw.restrictionCode == null || raw.restrictionCode === undefined ? null : String(raw.restrictionCode);
    const eligibilityRestriction =
      raw.eligibilityRestrictionCode == null || raw.eligibilityRestrictionCode === undefined
        ? null
        : String(raw.eligibilityRestrictionCode);
    const senderEligible = raw.senderEligible !== undefined ? Boolean(raw.senderEligible) : true;
    return {
      recipientUserId: Number(raw.recipientUserId ?? raw.receiverUserId ?? recipientUserId),
      canSend: Boolean(raw.canSend),
      lastSentAt: raw.lastSentAt == null ? null : String(raw.lastSentAt),
      nextAllowedAt: raw.nextAllowedAt == null ? null : String(raw.nextAllowedAt),
      restrictionCode: restriction,
      senderEligible,
      eligibilityRestrictionCode: eligibilityRestriction,
    };
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível verificar este sinal."));
  }
}

export async function sendProfileSignal(
  recipientUserId: number,
  type: ProfileSignalType
): Promise<ProfileSignal> {
  try {
    const { data } = await api.post("/profile-signals", { receiverUserId: recipientUserId, type });
    return mapProfileSignal(data);
  } catch (e) {
    throw new Error(getProfileSignalSendErrorMessage(e));
  }
}

/** Mensagem amigável para erros de envio (usa corpo da API quando existir). */
export function getProfileSignalSendErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const fromBody = getMessageFromApiResponseData(err.response?.data);
    if (fromBody) return fromBody;
  }
  return getApiErrorMessage(err, "Não foi possível enviar o sinal.");
}

export async function fetchReceivedProfileSignals(page = 1, pageSize = 20): Promise<ProfileSignalsPage> {
  try {
    const { data } = await api.get("/profile-signals/received", { params: { page, pageSize } });
    return mapSignalsPage(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar os sinais."));
  }
}

/** Sinais em estado enviado (ainda não lidos). Fonte de verdade no backend. */
export async function fetchProfileSignalsUnreadCount(): Promise<number> {
  try {
    const { data } = await api.get("/profile-signals/received/unread-count");
    const raw = asRecord(data);
    return Math.max(0, Math.floor(Number(raw.unreadCount ?? 0)));
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível atualizar os sinais."));
  }
}

export async function archiveProfileSignal(signalId: number): Promise<ProfileSignal> {
  try {
    const { data } = await api.patch(`/profile-signals/${signalId}/archive`);
    return mapProfileSignal(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível arquivar o sinal."));
  }
}

export async function markProfileSignalRead(signalId: number): Promise<ProfileSignal> {
  try {
    const { data } = await api.patch(`/profile-signals/${signalId}/read`);
    return mapProfileSignal(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível marcar o sinal como lido."));
  }
}

export async function dismissProfileSignal(signalId: number): Promise<ProfileSignal> {
  try {
    const { data } = await api.patch(`/profile-signals/${signalId}/dismiss`);
    return mapProfileSignal(data);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível ignorar o sinal."));
  }
}
