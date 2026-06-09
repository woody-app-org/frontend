export type LaunchMode = "app" | "waitlist_form" | "coming_soon";

export function getLaunchMode(): LaunchMode {
  const raw = import.meta.env.VITE_PUBLIC_LAUNCH_MODE?.toString().trim();
  if (raw === "waitlist_form") return "waitlist_form";
  if (raw === "coming_soon") return "coming_soon";
  return "app";
}

export function isWaitlistFormMode(): boolean {
  return getLaunchMode() === "waitlist_form";
}

export function isComingSoonMode(): boolean {
  return getLaunchMode() === "coming_soon";
}
