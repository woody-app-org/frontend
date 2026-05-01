/**
 * Limites de UX para anexos em DMs, alinhados ao domínio/servidor
 * (`MediaReferenceConstraints.MessageVideo*`, `ImageMaxUploadBytes`).
 */
export const DM_MESSAGE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const DM_MESSAGE_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const DM_MESSAGE_VIDEO_MAX_DURATION_SEC = 30;

export { formatFileSize } from "@/domain/postMediaLimits";
