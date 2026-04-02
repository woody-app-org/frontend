/**
 * Denúncias enviadas pela sessão mock (substituir por POST /reports no backend).
 */
let reportsVersion = 0;
const reportListeners = new Set<() => void>();

/** viewerId -> postIds já denunciados */
const reportedPostsByViewer = new Map<string, Set<string>>();
/** viewerId -> commentIds já denunciados */
const reportedCommentsByViewer = new Map<string, Set<string>>();

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

/** @returns `false` se já existia denúncia desta usuária para o post. */
export function recordPostReport(viewerId: string, postId: string): boolean {
  let set = reportedPostsByViewer.get(viewerId);
  if (!set) {
    set = new Set();
    reportedPostsByViewer.set(viewerId, set);
  }
  if (set.has(postId)) return false;
  set.add(postId);
  bump();
  return true;
}

/** @returns `false` se já existia denúncia desta usuária para o comentário. */
export function recordCommentReport(viewerId: string, commentId: string): boolean {
  let set = reportedCommentsByViewer.get(viewerId);
  if (!set) {
    set = new Set();
    reportedCommentsByViewer.set(viewerId, set);
  }
  if (set.has(commentId)) return false;
  set.add(commentId);
  bump();
  return true;
}

export function resetContentReportMockStore(): void {
  reportedPostsByViewer.clear();
  reportedCommentsByViewer.clear();
  bump();
}
