import { ProtectedRoute } from "@/app/ProtectedRoute";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PostDetailPage } from "./PostDetailPage";
import { PublicPostPage } from "./PublicPostPage";

/**
 * Rota `/posts/:publicId` — autenticadas usam o detalhe completo; visitantes veem preview público.
 */
export function PostDetailRoutePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--woody-muted)]">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PublicPostPage />;
  }

  return (
    <ProtectedRoute>
      <PostDetailPage />
    </ProtectedRoute>
  );
}
