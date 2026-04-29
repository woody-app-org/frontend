import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import type { ProfileSignalOption } from "../services/profile-signals.service";

export interface ProfileSignalOptionCardProps {
  option: ProfileSignalOption;
  active: boolean;
  disabled?: boolean;
  onSelect: (option: ProfileSignalOption) => void;
}

export function ProfileSignalOptionCard({
  option,
  active,
  disabled = false,
  onSelect,
}: ProfileSignalOptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        woodyFocus.ring,
        "group touch-manipulation rounded-2xl border px-3 py-3.5 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 sm:min-h-[5.5rem] sm:py-4",
        "disabled:pointer-events-none disabled:opacity-60",
        active
          ? "border-[var(--woody-nav)] bg-[var(--woody-nav)]/10 shadow-[0_8px_22px_rgba(139,195,74,0.14)]"
          : "border-[var(--woody-divider)] bg-[var(--woody-card)] hover:-translate-y-0.5 hover:border-[var(--woody-nav)]/35 hover:bg-[var(--woody-nav)]/6"
      )}
      onClick={() => onSelect(option)}
    >
      <span className="block text-sm font-semibold text-[var(--woody-text)]">{option.label}</span>
      <span className="mt-1 block text-xs text-[var(--woody-muted)]">{option.hint}</span>
    </button>
  );
}
