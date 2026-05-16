import { getApiBaseUrl } from "@/lib/apiBaseUrl";

export type SocialNetwork =
  | "instagram"
  | "tiktok"
  | "x"
  | "threads"
  | "facebook";

export interface PreLaunchSignupPayload {
  name: string;
  socialNetwork: SocialNetwork;
  socialUsername: string;
  acceptedContact: boolean;
  /** Honeypot — deve permanecer vazio. */
  website: string;
}

export interface PreLaunchSignupResponse {
  success: boolean;
  message: string;
}

export async function submitPreLaunchSignup(
  payload: PreLaunchSignupPayload
): Promise<PreLaunchSignupResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/prelaunch/signups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : "Muitas tentativas. Tente novamente mais tarde.";
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg =
      data?.message || data?.error || "Algo deu errado. Tente novamente.";
    throw new Error(msg);
  }

  return data as PreLaunchSignupResponse;
}
