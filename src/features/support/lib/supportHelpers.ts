export type SupportTicketStatus = "Open" | "InReview" | "WaitingUser" | "Closed";
export type SupportTicketPriority = "Low" | "Normal" | "High" | "Urgent";
export type SupportTicketCategory =
  | "AccountAccess"
  | "ProfileVerification"
  | "AccountBanAppeal"
  | "ReportsAndSafety"
  | "Communities"
  | "BillingAndPlans"
  | "TechnicalBug"
  | "ProductSuggestion"
  | "Other";

export const SUPPORT_CATEGORY_OPTIONS: { value: SupportTicketCategory; label: string }[] = [
  { value: "AccountAccess", label: "Conta e acesso" },
  { value: "ProfileVerification", label: "Verificação de perfil" },
  { value: "AccountBanAppeal", label: "Banimento ou revisão de conta" },
  { value: "ReportsAndSafety", label: "Denúncias e segurança" },
  { value: "Communities", label: "Comunidades" },
  { value: "BillingAndPlans", label: "Pagamentos e planos" },
  { value: "TechnicalBug", label: "Bugs e problemas técnicos" },
  { value: "ProductSuggestion", label: "Sugestões para a Woody" },
  { value: "Other", label: "Outro" },
];

export const SUPPORT_STATUS_FILTER_OPTIONS: { value: SupportTicketStatus | ""; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "Open", label: "Aberta" },
  { value: "InReview", label: "Em análise" },
  { value: "WaitingUser", label: "Aguardando você" },
  { value: "Closed", label: "Encerrada" },
];

export const SUPPORT_PRIORITY_OPTIONS: { value: SupportTicketPriority; label: string }[] = [
  { value: "Low", label: "Baixa" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "Alta" },
  { value: "Urgent", label: "Urgente" },
];

export function categoryLabel(category: string): string {
  return SUPPORT_CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    Open: "Aberta",
    InReview: "Em análise",
    WaitingUser: "Aguardando você",
    Closed: "Encerrada",
  };
  return map[status] ?? status;
}

export function priorityLabel(priority: string): string {
  return SUPPORT_PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? priority;
}

export function formatSupportDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function isTicketClosed(status: string): boolean {
  return status === "Closed";
}
