import { AlertTriangle } from "lucide-react";
import type { AccountBannedLoginDetails } from "../errors/accountBannedLogin";
import { formatBannedAt } from "../errors/accountBannedLogin";
import { getSupportContactAction } from "../lib/supportContact";
import { cn } from "@/lib/utils";

const SUPPORT_HINT =
  "Caso você acredite que houve um engano, poderá solicitar uma revisão pelo suporte da Woody.";

export interface AccountBannedNoticeProps {
  details: AccountBannedLoginDetails;
  className?: string;
}

export function AccountBannedNotice({ details, className }: AccountBannedNoticeProps) {
  const support = getSupportContactAction();

  return (
    <section
      role="alert"
      aria-labelledby="account-banned-title"
      className={cn(
        "rounded-xl border border-amber-300/80 bg-amber-50 text-amber-950",
        "md:border-amber-200/60 md:bg-amber-950/40 md:text-amber-50",
        "px-4 py-4 space-y-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="size-5 shrink-0 mt-0.5 text-amber-700 md:text-amber-300"
          aria-hidden
        />
        <div className="space-y-2 min-w-0">
          <h3 id="account-banned-title" className="font-semibold text-base leading-snug">
            Conta desativada
          </h3>
          <p className="text-sm leading-relaxed">{details.message}</p>
          <p className="text-sm leading-relaxed">
            <span className="font-medium">Motivo:</span> {details.reason}
          </p>
          {details.bannedAt ? (
            <p className="text-sm leading-relaxed">
              <span className="font-medium">Data da decisão:</span>{" "}
              {formatBannedAt(details.bannedAt)}
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-amber-900/90 md:text-amber-100/90">
            {SUPPORT_HINT}
          </p>
        </div>
      </div>

      {support.kind === "link" ? (
        <a
          href={support.href}
          className="inline-flex w-full items-center justify-center rounded-xl h-10 px-4 text-sm font-semibold border border-amber-400/60 bg-white text-amber-950 hover:bg-amber-100/80 md:bg-amber-900/50 md:text-amber-50 md:hover:bg-amber-900/70 transition-colors"
        >
          {support.label}
        </a>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center rounded-xl h-10 px-4 text-sm font-semibold border border-amber-300/50 bg-amber-100/50 text-amber-800/70 cursor-not-allowed md:bg-amber-900/30 md:text-amber-200/70"
          >
            {support.label}
          </button>
          <p className="text-xs text-center text-amber-800/80 md:text-amber-100/75">
            Canal de suporte em breve.
          </p>
        </div>
      )}
    </section>
  );
}
