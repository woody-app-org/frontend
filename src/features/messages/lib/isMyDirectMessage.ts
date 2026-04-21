/**
 * Indica se o remetente da mensagem é o utilizador autenticado.
 * O backend usa `sender.id` numérico; a sessão guarda `user.id` em string (só dígitos).
 */
export function isMyDirectMessage(senderId: number, authUserId: string | undefined): boolean {
  if (authUserId == null || authUserId === "") return false;
  const trimmed = authUserId.trim();
  if (trimmed === "") return false;
  if (trimmed === String(senderId)) return true;
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isSafeInteger(n) && senderId === n;
  }
  return false;
}
