import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { mobileQr } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { ScrollReveal } from "../motion/ScrollReveal";
import { PwaInstallSheet } from "../pwa/PwaInstallSheet";
import { PWA_INSTALL_PATH } from "@/lib/pwa/types";
import { woodyFocus } from "@/lib/woody-ui";
import { cn } from "@/lib/utils";

const qrSize = 320;

function initialInstallOpenFromHash(embedInLanding: boolean): boolean {
  if (!embedInLanding || typeof window === "undefined") return false;
  const hash = window.location.hash.replace("#", "");
  if (hash === "install") {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#woody-no-celular`
    );
    return true;
  }
  return hash === "woody-no-celular";
}

export interface MobileQrNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function MobileQrNarrativeSection({ embedInLanding = false }: MobileQrNarrativeSectionProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [installOpen, setInstallOpen] = useState(() => initialInstallOpenFromHash(embedInLanding));
  const motion = embedInLanding;

  const targetUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${PWA_INSTALL_PATH}`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(targetUrl, {
      width: qrSize,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  const openInstall = () => setInstallOpen(true);

  return (
    <div className="bg-white">
      <div
        className={
          embedInLanding
            ? "mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)] py-12 md:py-24"
            : "mx-auto flex min-h-svh max-w-[var(--layout-max-width)] flex-col px-[var(--layout-gutter)] py-14 md:py-20"
        }
      >
        {!embedInLanding && (
          <div className="mb-10">
            <InstitutionalBackLink />
          </div>
        )}

        <div
          className={
            embedInLanding
              ? "grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-14"
              : "grid flex-1 grid-cols-1 items-center gap-8 pb-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-14"
          }
        >
          <ScrollReveal enabled={motion} yOffset={16} className="lg:pr-4">
            <h2 className="font-display text-center font-bold italic leading-[0.92] tracking-[-0.03em] text-[var(--woody-ink)] text-[clamp(2.2rem,12vw,3rem)] lg:text-left lg:text-[clamp(2.6rem,7vw,5.5rem)]">
              tenha
              <br />
              Woody
              <br />
              na palma
              <br />
              da sua
              <br />
              mão
            </h2>
          </ScrollReveal>

          <ScrollReveal enabled={motion} delayMs={100} yOffset={14}>
            <div className="relative mx-auto flex w-full max-w-[min(88vw,300px)] shrink-0 flex-col items-center justify-center gap-2">
              <button
                type="button"
                data-testid="pwa-qr-install-trigger"
                onClick={openInstall}
                aria-label="Instalar Woody no celular"
                className={cn(
                  "group cursor-pointer overflow-hidden rounded-2xl border border-[var(--woody-ink)]/12 bg-white p-3 shadow-sm ring-1 ring-black/[0.06]",
                  "transition-[box-shadow,transform] duration-200 hover:shadow-md active:scale-[0.98]",
                  woodyFocus
                )}
              >
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    width={qrSize}
                    height={qrSize}
                    className="size-[min(76vw,280px)] pointer-events-none"
                    alt=""
                    aria-hidden
                  />
                ) : (
                  <div
                    className="flex size-[min(76vw,280px)] items-center justify-center bg-white text-sm text-black/35"
                    aria-hidden
                  >
                    Gerando QR…
                  </div>
                )}
              </button>
              <p className="text-center text-xs font-medium text-[var(--woody-muted)] md:text-sm">
                {mobileQr.installHint}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal enabled={motion} delayMs={200} yOffset={12} className="text-center lg:text-right">
            <button
              type="button"
              onClick={openInstall}
              aria-label="Instalar Woody no celular"
              className={cn(
                "font-heading mx-auto max-w-[min(100%,18rem)] text-balance font-extrabold uppercase leading-[1.2] text-[var(--woody-ink)]",
                "text-[clamp(0.82rem,3.5vw,1.1rem)] tracking-[0.07em]",
                "cursor-pointer transition-opacity hover:opacity-80 active:opacity-70",
                "lg:mx-0 lg:ml-auto lg:max-w-[17rem] lg:text-[clamp(0.85rem,2.2vw,1.4rem)] lg:tracking-[0.06em]",
                woodyFocus,
                "rounded-lg"
              )}
            >
              {mobileQr.instructions.toUpperCase()}
            </button>
          </ScrollReveal>
        </div>
      </div>

      <PwaInstallSheet open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  );
}
