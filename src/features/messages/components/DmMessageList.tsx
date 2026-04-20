import { useLayoutEffect, useRef } from "react";
import type { MessageResponseDto } from "../types";
import { DmMessageBubble } from "./DmMessageBubble";

export interface DmMessageListProps {
  messages: MessageResponseDto[];
  myNumericId: number;
  onSaveEdit: (messageId: number, body: string) => Promise<void>;
  onDelete: (messageId: number) => Promise<void>;
  onMutationError: (message: string) => void;
}

export function DmMessageList({ messages, myNumericId, onSaveEdit, onDelete, onMutationError }: DmMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4">
      <ul className="m-0 flex list-none flex-col gap-3 p-0 pb-2">
        {messages.map((m) => (
          <DmMessageBubble
            key={m.id}
            message={m}
            isMine={m.sender.id === myNumericId}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
            onMutationError={onMutationError}
          />
        ))}
        <div ref={bottomRef} className="h-1 shrink-0" aria-hidden />
      </ul>
    </div>
  );
}
