export type EmailRateLimitCode = "EMAIL_RATE_LIMITED" | "EMAIL_VERIFY_RATE_LIMITED" | "RATE_LIMITED";

export class EmailVerificationRateLimitError extends Error {
  readonly retryAfterSeconds: number;
  readonly code: EmailRateLimitCode;

  constructor(message: string, retryAfterSeconds: number, code: EmailRateLimitCode) {
    super(message);
    this.name = "EmailVerificationRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
    this.code = code;
  }
}
