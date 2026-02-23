import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MOCK_SUGGESTIONS: { id: string; name: string; avatarUrl: string }[] = [];

const MOCK_FOLLOWING = [
  {
    id: "1",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: "6",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  },
];

export interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className }: RightPanelProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-full min-w-0 bg-[var(--woody-bg)] border-l border-[var(--woody-nav)]/10",
        className
      )}
    >
      <div className="p-4 space-y-4">
        <section>
          <h2 className="text-sm font-semibold text-[var(--woody-text)] mb-2">
            Sugestões
          </h2>
          <Card className="bg-[var(--woody-card)] border-[var(--woody-accent)]/20">
            <CardContent className="p-4 min-h-[80px]">
              {MOCK_SUGGESTIONS.length === 0 ? (
                <p className="text-sm text-[var(--woody-muted)]">
                  Nenhuma sugestão no momento.
                </p>
              ) : (
                <ul className="space-y-3">
                  {MOCK_SUGGESTIONS.map((user) => (
                    <li key={user.id} className="flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-[var(--woody-text)] truncate">
                        {user.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-[var(--woody-text)] mb-2">
            Seguindo
          </h2>
          <Card className="bg-[var(--woody-card)] border-[var(--woody-accent)]/20">
            <CardHeader className="p-0" />
            <CardContent className="p-4">
              <ul className="space-y-3">
                {MOCK_FOLLOWING.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-2.5 py-0.5"
                  >
                    <Avatar size="sm" className="size-8 shrink-0">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="text-xs bg-[var(--woody-nav)]/10 text-[var(--woody-text)]">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-[var(--woody-text)] truncate flex-1">
                      {user.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </aside>
  );
}
