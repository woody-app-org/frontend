import { Check } from "lucide-react";
import { WOODY_PRO_BENEFIT_LINES } from "../lib/subscriptionCopy";

export function ProUpgradeBenefitsList({ className }: { className?: string }) {
  return (
    <ul className={className ?? "space-y-2 text-sm text-[var(--woody-text)]"}>
      {WOODY_PRO_BENEFIT_LINES.map((t) => (
        <li key={t} className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-[var(--woody-nav)]" aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
