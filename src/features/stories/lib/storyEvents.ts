/** Disparado após criar, apagar ou consumir stories — a StoriesBar no feed pode refazer o fetch. */
export const STORIES_CHANGED_EVENT = "woody-stories-changed";

export function dispatchStoriesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STORIES_CHANGED_EVENT));
}
