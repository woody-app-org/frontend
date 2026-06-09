import type { Post } from "@/domain/types";
import { absolutePostUrlForPost } from "./postPaths";

/** Partilha nativa (WhatsApp, etc.) só para posts com preview público plausível. */
export function canSharePostExternally(post: Post): boolean {
  if (post.publicationContext === "profile") return true;
  if (post.publicationContext === "community") {
    return post.community?.visibility !== "private";
  }
  return true;
}

export function resolveShareUrl(post: Post): string {
  return absolutePostUrlForPost(post);
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function copyPostLinkToClipboard(post: Post): Promise<void> {
  const url = resolveShareUrl(post);
  await navigator.clipboard.writeText(url);
}

export async function sharePostNatively(post: Post): Promise<"shared" | "aborted" | "unsupported"> {
  if (!canUseNativeShare()) return "unsupported";
  const url = resolveShareUrl(post);
  try {
    await navigator.share({
      title: "Publicação na Woody",
      text: "Olha esta publicação na Woody",
      url,
    });
    return "shared";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "aborted";
    throw e;
  }
}
