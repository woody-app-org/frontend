import { useCallback, useMemo, useState } from "react";
import type { StoryViewerModalProps } from "../components/StoryViewerModal";

type Target = { userId: string; initialStoryIndex?: number };

export function useStoryViewerState() {
  const [target, setTarget] = useState<Target | null>(null);

  const open = useCallback((userId: string, initialStoryIndex?: number) => {
    setTarget({ userId, initialStoryIndex });
  }, []);

  const close = useCallback(() => setTarget(null), []);

  const modalProps = useMemo(
    (): Pick<StoryViewerModalProps, "open" | "userId" | "initialStoryIndex" | "onOpenChange"> => ({
      open: target != null,
      userId: target?.userId ?? "",
      initialStoryIndex: target?.initialStoryIndex,
      onOpenChange: (open) => {
        if (!open) close();
      },
    }),
    [target, close]
  );

  return { open, close, modalProps, isOpen: target != null };
}
