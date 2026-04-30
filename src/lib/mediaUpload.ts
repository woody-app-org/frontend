import axios from "axios";
import { api, getApiErrorMessage } from "@/lib/api";

export interface MediaUploadResult {
  url: string;
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  mediaKind: string;
}

function readErrorMessage(e: unknown): string | null {
  if (!axios.isAxiosError(e)) return null;
  const d = e.response?.data as { error?: string } | undefined;
  return d?.error?.trim() || null;
}

export async function uploadImageMedia(file: File): Promise<MediaUploadResult> {
  const form = new FormData();
  form.append("file", file);
  try {
    const { data } = await api.post<MediaUploadResult>("media/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    throw new Error(readErrorMessage(e) ?? getApiErrorMessage(e, "Falha no upload da imagem."));
  }
}

export async function uploadVideoMedia(file: File): Promise<MediaUploadResult> {
  const form = new FormData();
  form.append("file", file);
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
