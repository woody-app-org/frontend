/**
 * Contrato de denúncia de conteúdo (posts/comentários).
 * TODO(backend): alinhar a DTO `POST /reports` ou equivalente.
 */
export type ContentReportReasonCode =
  | "harassment"
  | "spam"
  | "inappropriate"
  | "community_rules"
  | "other";

export const CONTENT_REPORT_REASON_OPTIONS: readonly {
  readonly code: ContentReportReasonCode;
  readonly label: string;
}[] = [
  { code: "harassment", label: "Assédio ou ofensa" },
  { code: "spam", label: "Spam" },
  { code: "inappropriate", label: "Conteúdo inadequado" },
  { code: "community_rules", label: "Violação de regras da comunidade" },
  { code: "other", label: "Outro" },
] as const;

/** Payload enviado pelo formulário de denúncia (mock e futura API). */
export interface SubmitContentReportInput {
  reasonCode: ContentReportReasonCode;
  /** Observação livre curta (opcional). */
  details?: string;
}
