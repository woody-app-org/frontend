import type { Post, PostPublicationContext } from "@/domain/types";
import axios from "axios";
import { api, getApiErrorMessage, getMessageFromApiResponseData } from "@/lib/api";
import { mapPostFromApi } from "@/lib/apiMappers";
import { readImageAsDataUrlIfSmall } from "@/lib/readImageAsDataUrlIfSmall";

/** @deprecated Preferir `readImageAsDataUrlIfSmall` de `@/lib/readImageAsDataUrlIfSmall`. */
export const readImageFileAsDataUrlIfSmall = readImageAsDataUrlIfSmall;

/** Alinhado a `InputValidationLimits.PostContentMaxLength` no backend. */
export const POST_COMPOSER_CONTENT_MAX_LENGTH = 20_000;

/**
 * Corpo de `POST /posts`. Campos estáveis para evoluções futuras (rascunhos, edição) sem mudar o contrato base.
 */
export interface CreatePostPayload {
  publicationContext: PostPublicationContext;
  /** Obrigatório quando `publicationContext` é <code>community</code>. */
  communityId?: string;
  content: string;
  tags?: string[];
  imageUrl?: string | null;
  imageUrls?: string[];
  /** Anexos tipados (prioridade sobre <code>imageUrl</code> / <code>imageUrls</code>). */
  mediaAttachments?: CreatePostMediaAttachmentPayload[];
}

/** Corpo JSON de <code>mediaAttachments</code> em <code>POST /posts</code> (camelCase). */
export type CreatePostMediaAttachmentPayload = {
  url: string;
  mediaType: "image" | "video" | "gif" | "sticker";
  durationSeconds?: number;
  /** Devolvido pelo upload Woody; opcional mas recomendado para CDN/migração. */
  storageKey?: string;
  mimeType?: string;
  fileSize?: number;
  /** Poster de vídeo (URL de imagem após upload). */
  thumbnailUrl?: string;
};

/**
 * Cria post na API (`POST /posts`). Corpo em camelCase (serialização .NET).
 */
export async function createPost(payload: CreatePostPayload, viewerId: string): Promise<Post> {
  const content = payload.content.trim();
  if (content.length > POST_COMPOSER_CONTENT_MAX_LENGTH) {
    throw new Error(`O texto pode ter no máximo ${POST_COMPOSER_CONTENT_MAX_LENGTH} caracteres.`);
  }

  try {
    const body: Record<string, unknown> = {
      publicationContext: payload.publicationContext,
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
        throw new Error(getApiErrorMessage(e, "Pedido inválido. Verifica o texto, hashtags e mídia."));
      }
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível publicar."));
  }
}
