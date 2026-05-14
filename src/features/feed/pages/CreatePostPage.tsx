import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeedLayout } from "../components/FeedLayout";
import { CreatePostCard } from "../components/CreatePostCard";
import { useCreatePostComposer } from "../context/CreatePostComposerContext";
import { cn } from "@/lib/utils";
import { woodyLayout, woodySection } from "@/lib/woody-ui";
import { Button } from "@/components/ui/button";

/** Corpo da página: dentro de `FeedLayout` para usar `CreatePostComposerProvider`. */
function CreatePostPageContent() {
  const navigate = useNavigate();
  const { runAfterPostCreated } = useCreatePostComposer();

  return (
    <div
      className={cn(
        "flex max-w-4xl flex-1 flex-col mx-auto w-full",
        woodyLayout.pagePad,
        woodyLayout.stackGap
      )}
    >
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2 gap-1 text-[var(--woody-text)]" asChild>
          <Link to="/feed">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar ao feed
          </Link>
        </Button>
      </div>

      <div>
        <h1 className={woodySection.title}>Nova publicação</h1>
        <p className={woodySection.subtitle}>
          Escreve o que quiseres partilhar; podes anexar fotos ou um vídeo e até três hashtags. Não é preciso
          cabeçalho nem formato de artigo — é conversa aberta.
        </p>
      </div>

      <CreatePostCard
        onPostCreated={(post) => {
          runAfterPostCreated(post, "/criar");
          navigate("/feed", { replace: true, state: { createdPostFromComposer: true } });
        }}
      />
    </div>
  );
}

/**
 * Tela dedicada para criação (mobile: item «Criar» na barra inferior).
 */
export function CreatePostPage() {
  return (
    <FeedLayout>
      <CreatePostPageContent />
    </FeedLayout>
  );
}
