import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const styles = {
  card:
    "rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)]",
  title: "text-base font-bold text-[var(--woody-text)]",
  content: "text-[var(--woody-text)]/90 text-sm leading-relaxed whitespace-pre-wrap break-words",
  readMore:
    "text-sm font-medium text-[var(--woody-accent)] hover:underline mt-2 inline-block",
};

const BIO_MAX_LENGTH = 180;

export interface ProfileAboutProps {
  bio: string;
  className?: string;
}

export function ProfileAbout({ bio, className }: ProfileAboutProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = bio.length > BIO_MAX_LENGTH;
  const displayBio = shouldTruncate && !expanded ? `${bio.slice(0, BIO_MAX_LENGTH)}...` : bio;

  return (
    <Card className={cn(styles.card, className)}>
      <CardHeader className="pb-1">
        <h2 className={styles.title}>Sobre mim</h2>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={styles.content}>{displayBio}</p>
        {shouldTruncate && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={styles.readMore}
          >
            {expanded ? "Leia menos" : "Leia mais"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
