import { api, getApiErrorMessage, getMessageFromApiResponseData } from "@/lib/api";
import axios from "axios";

/**
 * Fixa uma publicação da utilizadora no próprio perfil (`POST /posts/:id/profile-pin`).
 * Permissões e limite são validados no servidor.
 */
export async function pinPostOnProfile(postId: string): Promise<void> {
  try {
    await api.post(`posts/${encodeURIComponent(postId)}/profile-pin`);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const fromBody = getMessageFromApiResponseData(e.response?.data);
      if (fromBody) throw new Error(fromBody);
      const status = e.response?.status;
      if (status === 403) throw new Error("Não tens permissão para fixar esta publicação.");
      if (status === 409) throw new Error("Atingiste o número máximo de publicações fixas no perfil.");
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível fixar a publicação."));
  }
}

export async function unpinPostFromProfile(postId: string): Promise<void> {
  try {
    await api.delete(`posts/${encodeURIComponent(postId)}/profile-pin`);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const fromBody = getMessageFromApiResponseData(e.response?.data);
      if (fromBody) throw new Error(fromBody);
      if (e.response?.status === 403) throw new Error("Não tens permissão para desafixar esta publicação.");
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível desafixar a publicação."));
  }
}

export async function pinCommentOnPost(postId: string, commentId: string): Promise<void> {
  try {
    await api.post(`posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/pin`);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const fromBody = getMessageFromApiResponseData(e.response?.data);
      if (fromBody) throw new Error(fromBody);
      if (e.response?.status === 403) throw new Error("Só a autora do post pode fixar um comentário.");
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível fixar o comentário."));
  }
}

export async function unpinCommentOnPost(postId: string, commentId: string): Promise<void> {
  try {
    await api.delete(`posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/pin`);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const fromBody = getMessageFromApiResponseData(e.response?.data);
      if (fromBody) throw new Error(fromBody);
      if (e.response?.status === 403) throw new Error("Só a autora do post pode desafixar o comentário.");
    }
    throw new Error(getApiErrorMessage(e, "Não foi possível desafixar o comentário."));
  }
}
