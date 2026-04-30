import type { Post, PostPublicationContext } from "@/domain/types";
import axios from "axios";
import { api, getApiErrorMessage, getMessageFromApiResponseData } from "@/lib/api";
import { mapPostFromApi } from "@/lib/apiMappers";
import { readImageAsDataUrlIfSmall } from "@/lib/readImageAsDataUrlIfSmall";

/** @deprecated Preferir `readImageAsDataUrlIfSmall` de `@/lib/readImageAsDataUrlIfSmall`. */
export const readImageFileAsDataUrlIfSmall = readImageAsDataUrlIfSmall;

/** Alinhado ao `maxLength` do composer e validação no servidor. */
export const POST_COMPOSER_TITLE_MAX_LENGTH = 200;
export const POST_COMPOSER_TAGS_MAX_COUNT = 20;

/**
 * Corpo de `POST /posts`. Campos estáveis para evoluções futuras (rascunhos, edição) sem mudar o contrato base.
 */
export interface CreatePostPayload {
  publicationContext: PostPublicationContext;
  /** Obrigatório quando `publicationContext` é <code>community</code>. */
  communityId?: string;
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string | null;
  imageUrls?: string[];
  /** Anexos tipados (prioridade sobre <code>imageUrl</code> / <code>imageUrls</code>). */
  mediaAttachments?: Array<{ url: string; mediaType: "image" | "video" | "gif" | "sticker"; durationSeconds?: number }>;
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
      publicationContext: payload.publicationContext,
      title,
      content,
    };
    if (payload.publicationContext === "community") {
      const cid = payload.communityId?.trim();
      if (!cid) throw new Error("Escolhe uma comunidade.");
      body.communityId = cid;
    }
    if (payload.tags && payload.tags.length > 0) body.tags = payload.tags;
    if (payload.mediaAttachments && payload.mediaAttachments.length > 0) body.mediaAttachments = payload.mediaAttachments;
    else if (payload.imageUrls && payload.imageUrls.length > 0) body.imageUrls = payload.imageUrls;
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
