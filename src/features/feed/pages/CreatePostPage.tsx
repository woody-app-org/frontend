import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeedLayout } from "../components/FeedLayout";
import { CreatePostCard } from "../components/CreatePostCard";
import { cn } from "@/lib/utils";
import { woodyLayout, woodySection } from "@/lib/woody-ui";
import { Button } from "@/components/ui/button";

/**
 * Tela dedicada para criação (mobile: item «Criar» na barra inferior).
 */
export function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <FeedLayout>
      <div
        className={cn(
          "flex flex-col flex-1 max-w-3xl mx-auto w-full",
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
            Escolha a comunidade, escreva o texto e opcionalmente adicione tags ou uma imagem.
          </p>
        </div>

        <CreatePostCard
          composerFeedback="none"
          onPostCreated={(post) => {
            navigate("/feed", { replace: true, state: { createdPostTitle: post.title } });
          }}
        />
      </div>
    </FeedLayout>
  );
}
