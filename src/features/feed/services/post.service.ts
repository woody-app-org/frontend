import type { Post } from "@/domain/types";
import axios from "axios";
import { api, getApiErrorMessage, getMessageFromApiResponseData } from "@/lib/api";
import { mapPostFromApi } from "@/lib/apiMappers";

const MAX_IMAGE_FILE_BYTES = 450 * 1024;

/** Alinhado ao `maxLength` do composer e validação no servidor. */
export const POST_COMPOSER_TITLE_MAX_LENGTH = 200;
export const POST_COMPOSER_TAGS_MAX_COUNT = 20;

export interface CreatePostPayload {
  communityId: string;
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string | null;
  imageUrls?: string[];
}

function normalizeTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;]+/)) {
    const t = part.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= POST_COMPOSER_TAGS_MAX_COUNT) break;
  }
  return out;
}

export { normalizeTags as normalizePostComposerTags };

export function readImageFileAsDataUrlIfSmall(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return Promise.reject(
      new Error(`A imagem deve ter no máximo ${Math.round(MAX_IMAGE_FILE_BYTES / 1024)} KB (até haver upload direto para o servidor).`)
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

/**
 * Cria post na API (`POST /posts`). Corpo em camelCase (serialização .NET).
 */
export async function createPost(payload: CreatePostPayload, viewerId: string): Promise<Post> {
  const title = payload.title.trim();
  const content = payload.content.trim();
  if (title.length > POST_COMPOSER_TITLE_MAX_LENGTH) {
    throw new Error(`O título pode ter no máximo ${POST_COMPOSER_TITLE_MAX_LENGTH} caracteres.`);
  }

  try {
    const body: Record<string, unknown> = {
      communityId: payload.communityId,
      title,
      content,
    };
    if (payload.tags && payload.tags.length > 0) body.tags = payload.tags;
    if (payload.imageUrls && payload.imageUrls.length > 0) body.imageUrls = payload.imageUrls;
    else if (payload.imageUrl) body.imageUrl = payload.imageUrl;

    const { data } = await api.post("posts", body);
    return mapPostFromApi(data as Record<string, unknown>, viewerId);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const fromBody = getMessageFromApiResponseData(e.response?.data);
      if (fromBody) throw new Error(fromBody);
      const status = e.response?.status;
      if (status === 403) {
        throw new Error("Não tens permissão para publicar nesta comunidade (é preciso ser membra ativa).");
      }
      if (status === 404) {
        throw new Error("Esta comunidade não existe ou já não está disponível.");
      }
      if (status === 400) {
        throw new Error(getApiErrorMessage(e, "Pedido inválido. Verifica título, conteúdo e imagens."));
      }
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível publicar."));
  }
}
