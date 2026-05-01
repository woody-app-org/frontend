import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import logoWoody from "@/assets/logo.svg";
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
    <div
      className={
        embedInLanding
          ? "overflow-hidden bg-black text-white"
          : "min-h-svh overflow-hidden bg-black text-white"
      }
    >
      <div
        className={
          embedInLanding
            ? "mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)] py-16 md:py-24"
            : "mx-auto flex min-h-svh max-w-[var(--layout-max-width)] flex-col px-[var(--layout-gutter)] py-10 md:py-14"
        }
      >
        {!embedInLanding ? (
          <div className="text-white/60 [&_a]:text-white/85 [&_a]:hover:text-white">
            <InstitutionalBackLink className="!mb-6 !text-white/55 hover:!text-white md:!mb-8" />
          </div>
        ) : null}

        <div
          className={
            embedInLanding
              ? "grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6 lg:gap-x-4 xl:gap-x-8"
              : "grid flex-1 grid-cols-1 items-center gap-12 pb-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6 lg:gap-x-4 xl:gap-x-8"
          }
        >
          <ScrollReveal enabled={motion} yOffset={16} className="lg:pr-4">
            <h2 className="max-w-[min(100%,22rem)] font-sans text-[clamp(2rem,5.5vw,3.75rem)] font-black leading-[0.95] tracking-[-0.03em] text-[#8dbf43] md:max-w-none">
              {mobileQr.title}
            </h2>
            <img
              src={logoWoody}
              alt=""
              width={399}
              height={83}
              className="mt-5 h-auto w-[min(100%,14rem)] object-contain object-left opacity-95 md:mt-6 md:w-[min(100%,17rem)]"
              decoding="async"
              aria-hidden
            />
          </ScrollReveal>

          <ScrollReveal enabled={motion} delayMs={100} yOffset={14}>
            <div className="relative mx-auto flex w-full max-w-[min(88vw,340px)] shrink-0 justify-center">
              <div className="relative rounded-[2.5rem] border border-white/[0.12] bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(141,191,67,0.2)] md:p-5">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-3 ring-1 ring-black/15">
                  {dataUrl ? (
                    <img
                      src={dataUrl}
                      width={qrSize}
                      height={qrSize}
                      className="size-[min(78vw,320px)]"
                      alt="Código QR para abrir a Woody no telemóvel"
                    />
                  ) : (
                    <div className="flex size-[min(78vw,320px)] items-center justify-center bg-white text-sm text-black/45">
                      A gerar QR…
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal enabled={motion} delayMs={200} yOffset={12} className="text-left lg:text-right">
            <p className="max-w-[min(100%,17rem)] font-sans text-[clamp(1.02rem,2.28vw,2.2rem)] font-extrabold uppercase leading-[0.98] tracking-[0.1em] text-white md:max-w-[18rem] lg:ml-auto lg:max-w-[18.5rem] xl:max-w-[19.5rem]">
              {mobileQr.instructions}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
