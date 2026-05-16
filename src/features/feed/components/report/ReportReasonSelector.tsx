import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import {
  CONTENT_REPORT_REASON_OPTIONS,
  type ContentReportReasonCode,
} from "@/domain/contentReport";

export interface ReportReasonSelectorProps {
  value: ContentReportReasonCode | null;
  onChange: (code: ContentReportReasonCode) => void;
  disabled?: boolean;
  name: string;
}

export function ReportReasonSelector({ value, onChange, disabled, name }: ReportReasonSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium text-[var(--woody-text)]">Motivo da denúncia</legend>
      <ul className="m-0 list-none space-y-2 p-0">
        {CONTENT_REPORT_REASON_OPTIONS.map((opt) => {
          const checked = value === opt.code;
          return (
            <li key={opt.code}>
              <label
                className={cn(
                  woodyFocus.ring,
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  checked
                    ? "border-[var(--woody-accent)]/35 bg-[var(--woody-nav)]/8"
                    : "border-[var(--woody-accent)]/12 bg-[var(--woody-bg)] hover:border-[var(--woody-accent)]/20",
                  disabled && "pointer-events-none opacity-50"
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={opt.code}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(opt.code)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--woody-nav)]"
                />
                <span className="text-sm leading-snug text-[var(--woody-text)]">{opt.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
