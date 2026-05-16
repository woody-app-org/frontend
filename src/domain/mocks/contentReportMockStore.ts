/**
 * Denúncias enviadas pela sessão mock (substituir por POST /reports no backend).
 */
import type { ContentReportReasonCode } from "../contentReport";

let reportsVersion = 0;
const reportListeners = new Set<() => void>();

/** viewerId -> postIds já denunciados */
const reportedPostsByViewer = new Map<string, Set<string>>();
/** viewerId -> commentIds já denunciados */
const reportedCommentsByViewer = new Map<string, Set<string>>();

/** Registro enriquecido para debug / futura fila de moderação (não exposto na UI). */
export interface MockContentReportRecord {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  postId: string;
  viewerId: string;
  reasonCode: ContentReportReasonCode;
  details?: string;
  createdAt: string;
}

const reportRecords: MockContentReportRecord[] = [];
const MAX_REPORT_RECORDS = 200;

function pushReportRecord(entry: Omit<MockContentReportRecord, "id" | "createdAt">): void {
  const id = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  reportRecords.push({
    ...entry,
    id,
    createdAt: new Date().toISOString(),
  });
  while (reportRecords.length > MAX_REPORT_RECORDS) {
    reportRecords.shift();
  }
}

/** Inspeção em testes ou futura integração; não usar na UI de usuária. */
export function getMockContentReportRecords(): readonly MockContentReportRecord[] {
  return reportRecords;
}

function bump(): void {
  reportsVersion += 1;
  reportListeners.forEach((fn) => fn());
}

export function subscribeContentReports(onChange: () => void): () => void {
  reportListeners.add(onChange);
  return () => reportListeners.delete(onChange);
}

export function getContentReportsVersion(): number {
  return reportsVersion;
}

export function hasViewerReportedPost(viewerId: string, postId: string): boolean {
  return reportedPostsByViewer.get(viewerId)?.has(postId) ?? false;
}

export function hasViewerReportedComment(viewerId: string, commentId: string): boolean {
  return reportedCommentsByViewer.get(viewerId)?.has(commentId) ?? false;
}

export interface RecordReportPayload {
  reasonCode: ContentReportReasonCode;
  details?: string;
}

/** @returns `false` se já existia denúncia desta usuária para o post. */
export function recordPostReport(viewerId: string, postId: string, meta?: RecordReportPayload): boolean {
  let set = reportedPostsByViewer.get(viewerId);
  if (!set) {
    set = new Set();
    reportedPostsByViewer.set(viewerId, set);
  }
  if (set.has(postId)) return false;
  set.add(postId);
  if (meta) {
    pushReportRecord({
      targetType: "post",
      targetId: postId,
      postId,
      viewerId,
      reasonCode: meta.reasonCode,
      details: meta.details,
    });
  }
  bump();
  return true;
}

export interface RecordCommentReportMeta extends RecordReportPayload {
  postId: string;
}

/** @returns `false` se já existia denúncia desta usuária para o comentário. */
export function recordCommentReport(
  viewerId: string,
  commentId: string,
  meta?: RecordCommentReportMeta
): boolean {
  let set = reportedCommentsByViewer.get(viewerId);
  if (!set) {
    set = new Set();
    reportedCommentsByViewer.set(viewerId, set);
  }
  if (set.has(commentId)) return false;
  set.add(commentId);
  if (meta) {
    pushReportRecord({
      targetType: "comment",
      targetId: commentId,
      postId: meta.postId,
      viewerId,
      reasonCode: meta.reasonCode,
      details: meta.details,
    });
  }
  bump();
  return true;
}

export function resetContentReportMockStore(): void {
  reportedPostsByViewer.clear();
  reportedCommentsByViewer.clear();
  reportRecords.length = 0;
  bump();
}
