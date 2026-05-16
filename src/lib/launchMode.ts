export type LaunchMode = "waitlist_form" | "app";

export function getLaunchMode(): LaunchMode {
  const raw = import.meta.env.VITE_PUBLIC_LAUNCH_MODE?.toString().trim();
  if (raw === "waitlist_form") return "waitlist_form";
  return "app";
}

export function isWaitlistFormMode(): boolean {
  return getLaunchMode() === "waitlist_form";
}
