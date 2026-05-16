import { MOCK_PRIMARY_USER_ID } from "@/domain/mocks/constants";
import { useAuth } from "../context/AuthContext";

/**
 * ID da sessão atual. Fallback no seed quando ainda não há `user` (não deve ocorrer em rotas protegidas).
 */
export function useViewerId(): string {
  const { user } = useAuth();
  return user?.id ?? MOCK_PRIMARY_USER_ID;
}
