import * as React from "react";
import { useState } from "react";
import { ImagePlus, Paperclip, Mic, AtSign, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOCK_USER = {
  name: "Seu nome",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
};

export interface CreatePostCardProps {
  onSubmit?: (topic: string, content: string) => void;
  className?: string;
}

export function CreatePostCard({ onSubmit, className }: CreatePostCardProps) {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (topic.trim() || content.trim()) {
      onSubmit?.(topic.trim(), content.trim());
      setTopic("");
      setContent("");
    }
  };

  const initials = MOCK_USER.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className={cn(
        "border-[var(--woody-accent)]/20 bg-[var(--woody-card)]",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex gap-3">
          <Avatar size="sm" className="size-9 shrink-0">
            <AvatarImage src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-3">
            <Input
              placeholder="Criar tópico"
              value={topic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              className="bg-[var(--woody-bg)] border-[var(--woody-nav)]/20 text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]"
            />
            <Textarea
              placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit risus..."
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              rows={3}
              className="min-h-20 resize-y bg-[var(--woody-bg)] border-[var(--woody-nav)]/20 text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[var(--woody-muted)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]"
                  aria-label="Adicionar imagem"
                >
                  <ImagePlus className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]"
                  aria-label="Adicionar arquivo"
                >
                  <Paperclip className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]"
                  aria-label="Áudio"
                >
                  <Mic className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]"
                  aria-label="Mencionar"
                >
                  <AtSign className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]"
                  aria-label="Emoji"
                >
                  <Smile className="size-4" />
                </Button>
              </div>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
              >
                Postar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
