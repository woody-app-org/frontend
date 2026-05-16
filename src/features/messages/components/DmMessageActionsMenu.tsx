import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export interface DmMessageActionsMenuProps {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function DmMessageActionsMenu({ canEdit, onEdit, onDelete, disabled }: DmMessageActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            woodyFocus.ring,
            "size-8 shrink-0 text-[var(--woody-muted)] opacity-70 hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)] hover:opacity-100"
          )}
          aria-label="Ações da mensagem"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem] border-[var(--woody-divider)] bg-[var(--woody-card)]">
        {canEdit ? (
          <DropdownMenuItem
            className="cursor-pointer gap-2 focus:bg-[var(--woody-nav)]/10"
            onSelect={(e) => {
              e.preventDefault();
              onEdit();
            }}
          >
            <Pencil className="size-4" />
            Editar
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2"
          onSelect={(e) => {
            e.preventDefault();
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
          Apagar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
