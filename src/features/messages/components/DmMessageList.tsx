import { useLayoutEffect, useRef, type RefObject } from "react";
import type { MessageResponseDto } from "../types";
import { isMyDirectMessage } from "../lib/isMyDirectMessage";
import { DmMessageBubble } from "./DmMessageBubble";

export interface DmMessageListProps {
  messages: MessageResponseDto[];
  currentUserId: string | undefined;
  onSaveEdit: (messageId: number, body: string) => Promise<void>;
  onDelete: (messageId: number) => Promise<void>;
  onMutationError: (message: string) => void;
  onOpenStory?: (authorUserId: number) => void;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function DmMessageList({
  messages,
  currentUserId,
  onSaveEdit,
  onDelete,
  onMutationError,
  onOpenStory,
  scrollContainerRef,
}: DmMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const assignScrollRef = (node: HTMLDivElement | null) => {
    scrollRef.current = node;
    if (scrollContainerRef) scrollContainerRef.current = node;
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={assignScrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4">
      <ul className="m-0 flex list-none flex-col gap-3 p-0 pb-2">
        {messages.map((m) => (
          <DmMessageBubble
            key={m.id}
            message={m}
            isMine={isMyDirectMessage(m.sender.id, currentUserId)}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
            onMutationError={onMutationError}
            onOpenStory={onOpenStory}
          />
        ))}
        <div ref={bottomRef} className="h-1 shrink-0" aria-hidden />
      </ul>
    </div>
  );
}
