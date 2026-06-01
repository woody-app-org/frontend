import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { mobileQr } from "../institutional/content";
import { InstitutionalBackLink } from "../institutional/components/InstitutionalBackLink";
import { ScrollReveal } from "../motion/ScrollReveal";

const qrSize = 320;

export interface MobileQrNarrativeSectionProps {
  embedInLanding?: boolean;
}

export function MobileQrNarrativeSection({ embedInLanding = false }: MobileQrNarrativeSectionProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const motion = embedInLanding;

  const targetUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/landing`;
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
          {/*
            Título — mobile: centralizado, tamanho proporcional.
            Desktop: alinhado à esquerda, maior (preservado).
          */}
          <ScrollReveal enabled={motion} yOffset={16} className="lg:pr-4">
            <h2 className="font-display font-bold italic leading-[0.92] tracking-[-0.03em] text-[var(--woody-ink)]
              text-center text-[clamp(2.2rem,12vw,3rem)]
              lg:text-left lg:text-[clamp(2.6rem,7vw,5.5rem)]">
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

          {/* QR code — único, centralizado. Sem duplicação. */}
          <ScrollReveal enabled={motion} delayMs={100} yOffset={14}>
            <div className="relative mx-auto flex w-full max-w-[min(88vw,300px)] shrink-0 justify-center">
              <div className="overflow-hidden rounded-2xl border border-[var(--woody-ink)]/12 bg-white p-3 shadow-sm ring-1 ring-black/[0.06]">
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    width={qrSize}
                    height={qrSize}
                    className="size-[min(76vw,280px)]"
                    alt="Código QR para abrir a Woody no telemóvel"
                  />
                ) : (
                  <div className="flex size-[min(76vw,280px)] items-center justify-center bg-white text-sm text-black/35">
                    Gerando QR…
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Instrução — mobile: centralizada abaixo do QR. Desktop: direita (preservado). */}
          <ScrollReveal enabled={motion} delayMs={200} yOffset={12} className="text-center lg:text-right">
            <p className="font-heading mx-auto max-w-[min(100%,18rem)] text-balance font-extrabold uppercase leading-[1.2] text-[var(--woody-ink)]
              text-[clamp(0.82rem,3.5vw,1.1rem)] tracking-[0.07em]
              lg:mx-0 lg:ml-auto lg:max-w-[17rem] lg:text-[clamp(0.85rem,2.2vw,1.4rem)] lg:tracking-[0.06em]">
              {mobileQr.instructions.toUpperCase()}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
