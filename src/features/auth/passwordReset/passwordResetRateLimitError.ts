export type PasswordResetRateLimitCode =
  | "EMAIL_RATE_LIMITED"
  | "EMAIL_VERIFY_RATE_LIMITED"
  | "PASSWORD_RESET_CONFIRM_RATE_LIMITED"
  | "RATE_LIMITED";

export class PasswordResetRateLimitError extends Error {
  readonly retryAfterSeconds: number;
  readonly code: PasswordResetRateLimitCode;

  constructor(message: string, retryAfterSeconds: number, code: PasswordResetRateLimitCode) {
    super(message);
    this.name = "PasswordResetRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
    this.code = code;
  }
}
