import axios from "axios";
import { api, getApiErrorMessage } from "@/lib/api";

export type PostPublicationContextUpload = "profile" | "community";

/** Contexto exigido pelo backend em `POST media/images` e `POST media/videos`. */
export type ScopedMediaUploadContext =
  | { scope: "post"; publicationContext: PostPublicationContextUpload; communityId?: string }
  | { scope: "message"; conversationId: string };

export interface MediaUploadResult {
  url: string;
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  mediaKind: string;
  durationMs?: number | null;
  durationSeconds?: number | null;
}

function readErrorMessage(e: unknown): string | null {
  if (!axios.isAxiosError(e)) return null;
  const d = e.response?.data as { error?: string } | undefined;
  return d?.error?.trim() || null;
}

function appendScopedFields(form: FormData, ctx: ScopedMediaUploadContext) {
  form.append("scope", ctx.scope);
  if (ctx.scope === "post") {
    form.append("publicationContext", ctx.publicationContext);
    if (ctx.publicationContext === "community" && ctx.communityId) {
      form.append("communityId", ctx.communityId);
    }
  } else {
    form.append("conversationId", ctx.conversationId);
  }
}

export async function uploadImageMedia(
  file: File,
  context: ScopedMediaUploadContext
): Promise<MediaUploadResult> {
  const form = new FormData();
  form.append("file", file);
  appendScopedFields(form, context);
  try {
    const { data } = await api.post<MediaUploadResult>("media/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    throw new Error(readErrorMessage(e) ?? getApiErrorMessage(e, "Falha no upload da imagem."));
  }
}

export async function uploadVideoMedia(
  file: File,
  context: ScopedMediaUploadContext,
  options?: { durationSeconds?: number }
): Promise<MediaUploadResult> {
  const form = new FormData();
  form.append("file", file);
  appendScopedFields(form, context);
  if (options?.durationSeconds != null && options.durationSeconds > 0) {
    form.append("durationSeconds", String(Math.round(options.durationSeconds)));
  }
  try {
    const { data } = await api.post<MediaUploadResult>("media/videos", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    throw new Error(readErrorMessage(e) ?? getApiErrorMessage(e, "Falha no upload do vídeo."));
  }
}

export function mediaTypeFromUpload(r: MediaUploadResult): "image" | "video" | "gif" {
  if (r.mediaKind === "video") return "video";
  if (r.contentType === "image/gif" || r.url.toLowerCase().includes(".gif")) return "gif";
  return "image";
}
