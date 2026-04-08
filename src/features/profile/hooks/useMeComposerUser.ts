import { useEffect, useState } from "react";
import type { User } from "@/domain/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { api } from "@/lib/api";
import { mapUserProfileFromApi } from "@/lib/apiMappers";

/**
 * Dados do perfil logado para o compositor de post (GET /users/me).
 * Sem armazenamento de ficheiros: `avatarUrl` pode vir vazio da API.
 */
export function useMeComposerUser(): { user: User | null; isLoading: boolean } {
  const { user: auth, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !auth) {
      setUser(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    api
      .get("/users/me")
      .then(({ data }) => {
        if (cancelled) return;
        const p = mapUserProfileFromApi(data as Record<string, unknown>);
        setUser({
          id: p.id,
          name: p.name,
          username: p.username ?? auth.username,
          avatarUrl: p.avatarUrl,
          pronouns: p.pronouns,
          bio: p.bio,
        });
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, auth?.id, auth?.username]);

  return { user, isLoading };
}
