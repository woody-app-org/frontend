/**
 * Moderação de conteúdo via API Woody.
 */
import axios from "axios";
import type { SubmitContentReportInput } from "../contentReport";
import type { Comment, Post } from "../types";
import { api, getApiErrorMessage } from "@/lib/api";
import { mapCommentFromApi, mapPostFromApi } from "@/lib/apiMappers";

export type ContentModerationErrorCode =
  | "unauthorized"
  | "not_found"
  | "validation"
  | "conflict"
  | "unknown";

export type ContentModerationResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ContentModerationErrorCode; message: string };

function err(
  code: ContentModerationErrorCode,
  message: string
): ContentModerationResult<never> {
  return { ok: false, code, message };
}

function mapAxiosCode(status: number | undefined): ContentModerationErrorCode {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  return "unknown";
}

export async function updatePostMock(
  postId: string,
  viewerId: string,
  patch: { title: string; content: string }
): Promise<ContentModerationResult<Post>> {
  try {
    const { data } = await api.patch(`/posts/${encodeURIComponent(postId)}`, {
      title: patch.title,
      content: patch.content,
    });
    return { ok: true, data: mapPostFromApi(data as Record<string, unknown>, viewerId) };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { ok: false, code: mapAxiosCode(e.response?.status), message: getApiErrorMessage(e) };
    }
    return err("unknown", "Falha ao atualizar a publicação.");
  }
}

export async function deletePostMock(
  postId: string,
  _viewerId: string
): Promise<ContentModerationResult<{ removed: true }>> {
  try {
    await api.delete(`/posts/${encodeURIComponent(postId)}`);
    return { ok: true, data: { removed: true } };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { ok: false, code: mapAxiosCode(e.response?.status), message: getApiErrorMessage(e) };
    }
    return err("unknown", "Falha ao remover a publicação.");
  }
}

export async function deleteCommentMock(
  commentId: string,
  _viewerId: string
): Promise<ContentModerationResult<{ removed: true }>> {
  try {
    await api.delete(`/comments/${encodeURIComponent(commentId)}`);
    return { ok: true, data: { removed: true } };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { ok: false, code: mapAxiosCode(e.response?.status), message: getApiErrorMessage(e) };
    }
    return err("unknown", "Falha ao excluir o comentário.");
  }
}

export async function hideCommentMock(
  commentId: string,
  _viewerId: string,
  postId: string
): Promise<ContentModerationResult<Comment>> {
  try {
    const { data } = await api.post(
      `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/hide`
    );
    return { ok: true, data: mapCommentFromApi(data as Record<string, unknown>) };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { ok: false, code: mapAxiosCode(e.response?.status), message: getApiErrorMessage(e) };
    }
    return err("unknown", "Falha ao ocultar o comentário.");
  }
}

export async function reportPostMock(
  postId: string,
  _viewerId: string,
  input: SubmitContentReportInput
): Promise<ContentModerationResult<{ reported: true }>> {
  try {
    await api.post("/reports", {
      targetType: "post",
      postId,
      reasonCode: input.reasonCode,
      details: input.details?.trim() || undefined,
    });
    return { ok: true, data: { reported: true } };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { ok: false, code: mapAxiosCode(e.response?.status), message: getApiErrorMessage(e) };
    }
    return err("unknown", "Falha ao enviar denúncia.");
  }
}

export async function reportCommentMock(
  commentId: string,
  _viewerId: string,
  input: SubmitContentReportInput & { postId: string }
): Promise<ContentModerationResult<{ reported: true }>> {
  try {
    await api.post("/reports", {
      targetType: "comment",
      postId: input.postId,
      commentId,
      reasonCode: input.reasonCode,
      details: input.details?.trim() || undefined,
    });
    return { ok: true, data: { reported: true } };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return { ok: false, code: mapAxiosCode(e.response?.status), message: getApiErrorMessage(e) };
    }
    return err("unknown", "Falha ao enviar denúncia.");
  }
}

export const contentModerationMockApi = {
  updatePost: updatePostMock,
  deletePost: deletePostMock,
  deleteComment: deleteCommentMock,
  hideComment: hideCommentMock,
  reportPost: reportPostMock,
  reportComment: reportCommentMock,
} as const;
