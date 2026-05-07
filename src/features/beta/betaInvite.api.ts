import { api } from "@/lib/api";

export interface ValidateInviteResponse {
  valid: boolean;
  message?: string;
}

export async function postValidateInvite(code: string): Promise<ValidateInviteResponse> {
  const { data } = await api.post<ValidateInviteResponse>("/beta/validate-invite", {
    code: code.trim(),
  });
  return data;
}
