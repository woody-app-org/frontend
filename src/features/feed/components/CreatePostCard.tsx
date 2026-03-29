import { useState, type ChangeEvent } from "react";
import { ImagePlus, Paperclip, Mic, AtSign, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { getUserById } from "@/domain/selectors";
import { useViewerId } from "@/features/auth/hooks/useViewerId";

// --- Helpers ---

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// --- Estilos padronizados (consistente com PostCard) ---

const styles = {
  card: cn(woodySurface.card, "flex flex-col gap-0 py-0 transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(92,58,59,0.06)]"),
  content: "px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5",
  header: "flex flex-row items-start gap-3",
  headerLeft: "flex min-w-0 flex-1 items-start gap-3",
  avatar: "size-9 shrink-0",
  headerMeta: "min-w-0 flex-1",
  authorName: "font-semibold text-[var(--woody-text)] text-[0.95rem] leading-tight truncate",
  authorPronouns: "text-[var(--woody-muted)] text-xs",
  formBlock: "flex-1 min-w-0 space-y-3 mt-3",
  input:
    "h-11 rounded-xl border border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/20 focus-visible:border-[var(--woody-accent)]/30 transition-colors",
  textarea:
    "min-h-20 resize-none sm:resize-y rounded-xl border border-[var(--woody-accent)]/20 bg-[var(--woody-bg)] text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] leading-relaxed focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/20 focus-visible:border-[var(--woody-accent)]/30 transition-colors",
  toolbarRow: "flex items-center justify-between gap-3 pt-1",
  toolbar: "flex items-center gap-0.5",
  toolbarBtn:
    "size-9 rounded-md text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)] transition-colors [&_svg]:size-4",
  submitBtn:
    "rounded-xl h-9 px-5 bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 active:bg-[var(--woody-nav)]/80 transition-colors disabled:opacity-50 disabled:pointer-events-none",
};

const TOOLBAR_ACTIONS = [
  { Icon: ImagePlus, ariaLabel: "Adicionar imagem" },
  { Icon: Paperclip, ariaLabel: "Adicionar arquivo" },
  { Icon: Mic, ariaLabel: "Áudio" },
  { Icon: AtSign, ariaLabel: "Mencionar" },
  { Icon: Smile, ariaLabel: "Emoji" },
] as const;

export interface CreatePostCardProps {
  onSubmit?: (topic: string, content: string) => void;
  className?: string;
}

export function CreatePostCard({ onSubmit, className }: CreatePostCardProps) {
  const viewerId = useViewerId();
  const currentUser = getUserById(viewerId);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (topic.trim() || content.trim()) {
      onSubmit?.(topic.trim(), content.trim());
      setTopic("");
      setContent("");
    }
  };

  const isSubmitDisabled = !topic.trim() && !content.trim();

  if (!currentUser) {
    return null;
  }

  return (
    <Card className={cn(styles.card, className)}>
      <CardContent className={styles.content}>
        {/* Header (composer: avatar + nome + pronouns) */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Avatar size="default" className={styles.avatar}>
              <AvatarImage src={currentUser.avatarUrl ?? undefined} alt={currentUser.name} />
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className={styles.headerMeta}>
              <div className="flex flex-wrap items-baseline gap-1">
                <span className={styles.authorName}>{currentUser.name}</span>
                {currentUser.pronouns && (
                  <>
                    <span className={styles.authorPronouns}>•</span>
                    <span className={cn(styles.authorPronouns, "truncate")}>
                      {currentUser.pronouns}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className={styles.formBlock}>
          <Input
            placeholder="Criar tópico"
            value={topic}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
            className={styles.input}
          />
          <Textarea
            placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit risus..."
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            rows={3}
            className={styles.textarea}
          />

          {/* Toolbar + Botão Postar */}
          <div className={styles.toolbarRow}>
            <div className={styles.toolbar}>
              {TOOLBAR_ACTIONS.map(({ Icon, ariaLabel }) => (
                <Button
                  key={ariaLabel}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={styles.toolbarBtn}
                  aria-label={ariaLabel}
                >
                  <Icon aria-hidden />
                </Button>
              ))}
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={styles.submitBtn}
            >
              Postar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
