import type { ScopedMediaUploadContext } from "@/lib/mediaUpload";

/** Upload de mídia para story via endpoints existentes (perfil público). */
export const STORY_MEDIA_UPLOAD_CONTEXT: ScopedMediaUploadContext = {
  scope: "post",
  publicationContext: "profile",
};
