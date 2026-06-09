/** Limites de UX alinhados ao upload de posts; o servidor valida de forma definitiva. */
export {
  POST_COMPOSER_IMAGE_MAX_BYTES as STORY_IMAGE_MAX_BYTES,
  POST_COMPOSER_VIDEO_MAX_BYTES as STORY_VIDEO_MAX_BYTES,
  POST_COMPOSER_VIDEO_MAX_DURATION_SEC as STORY_VIDEO_MAX_DURATION_SEC,
  formatFileSize,
} from "@/domain/postMediaLimits";

/** Espelho de `StoryPolicies.MaxTextLength` no backend. */
export const STORY_TEXT_MAX_LENGTH = 500;

export const STORY_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const STORY_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

export const STORY_VIDEO_MIME_OK = new Set(["video/mp4", "video/webm", "video/quicktime"]);
