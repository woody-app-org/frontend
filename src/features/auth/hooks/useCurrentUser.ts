import { useAuth } from "../context/AuthContext";
import type { CurrentUser } from "../types";

export function useCurrentUser(): CurrentUser | null {
  const { user } = useAuth();
  return user;
}
