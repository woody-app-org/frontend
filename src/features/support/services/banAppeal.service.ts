import { api } from "@/lib/api";

export interface BanAppealPayload {
  email: string;
  name?: string;
  description: string;
  /** Honeypot — deve permanecer vazio. */
  website?: string;
}

export interface BanAppealResponse {
  message: string;
}

export const BAN_APPEAL_SUCCESS_MESSAGE =
  "Recebemos sua solicitação. Se for necessário, a equipe da Woody entrará em contato.";

export async function submitBanAppeal(payload: BanAppealPayload): Promise<BanAppealResponse> {
  const body: Record<string, string> = {
    email: payload.email.trim(),
    description: payload.description.trim(),
  };
  const name = payload.name?.trim();
  if (name) body.name = name;
  const website = payload.website?.trim();
  if (website) body.website = website;

  const { data } = await api.post<BanAppealResponse>("/support/ban-appeals", body);
  return data;
}
