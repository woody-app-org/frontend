import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { shareStoryToConversation } from "../services/stories.service";
import type { Story } from "../types";

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Envia uma mensagem direta para a autora do story, com o story embutido como preview
 * (mirror de `usePostShare.sendToWoody`, simplificado para o destinatário já ser conhecido).
 */
export function useStorySendMessage(story: Story | null) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canSend = Boolean(story && message.trim().length > 0 && !isSending);

  const sendMessage = useCallback(async () => {
    if (!story) return;
    const text = message.trim();
    if (!text) return;

    setIsSending(true);
    try {
      await shareStoryToConversation(story.id, {
        recipientUserId: Number(story.authorUserId || story.author.id),
        message: text.slice(0, MAX_MESSAGE_LENGTH),
      });
      setMessage("");
      showSuccessToast("Mensagem enviada.", { id: `woody-story-dm-${story.id}` });
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : "Não foi possível enviar a mensagem.", {
        id: `woody-story-dm-err-${story.id}`,
      });
    } finally {
      setIsSending(false);
    }
  }, [story, message]);

  return { message, setMessage, canSend, isSending, sendMessage, maxLength: MAX_MESSAGE_LENGTH };
}
