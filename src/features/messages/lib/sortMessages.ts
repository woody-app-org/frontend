import type { MessageResponseDto } from "../types";

/** Ordenação estável: `createdAt` e desempate por `id` (evita reordenação ambígua com o mesmo timestamp). */
export function sortMessagesChronological(a: MessageResponseDto, b: MessageResponseDto): number {
  const t = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (t !== 0) return t;
  return a.id - b.id;
}
