import { api } from "@/lib/api";
import type { VerificationStatus } from "@/features/auth/types";

export interface VerificationStatusDto {
  status: VerificationStatus;
  rejectionReason?: string | null;
  documentSubmittedAt?: string | null;
  reviewedAt?: string | null;
  attemptCount: number;
  consentGivenAt?: string | null;
}

export async function getVerificationStatus(): Promise<VerificationStatusDto> {
  const { data } = await api.get<VerificationStatusDto>("/verification/status");
  return data;
}

export async function submitVerificationDocument(
  file: File,
  consentGiven: boolean,
  onProgress?: (pct: number) => void
): Promise<VerificationStatusDto> {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("ConsentGiven", String(consentGiven));
  const { data } = await api.post<VerificationStatusDto>("/verification/document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}

export async function deleteVerificationDocument(): Promise<VerificationStatusDto> {
  const { data } = await api.delete<VerificationStatusDto>("/verification/document");
  return data;
}

export async function submitAccessCode(code: string): Promise<VerificationStatusDto> {
  const { data } = await api.post<VerificationStatusDto>("/verification/access-code", {
    code: code.trim(),
  });
  return data;
}

/** Rota frontend correspondente ao status de verificação. */
export function resolveVerificationRoute(status: VerificationStatus | undefined): string {
  if (!status || status === "Approved") return "/feed";
  if (status === "PendingReview") return "/verification/pending";
  if (status === "Rejected") return "/verification/rejected";
  return "/verification/access-choice";
}
