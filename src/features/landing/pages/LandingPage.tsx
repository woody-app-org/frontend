import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { ScrollReveal } from "../motion/ScrollReveal";
import { LANDING_NARRATIVE_IDS } from "../constants";
import { MissionNarrativeSection } from "../narrative/MissionNarrativeSection";
import { MobileQrNarrativeSection } from "../narrative/MobileQrNarrativeSection";
import { NarrativeScrollSection } from "../narrative/NarrativeScrollSection";
import { PoliciesNarrativeSection } from "../narrative/PoliciesNarrativeSection";
import { RulesMarqueeBar } from "../narrative/RulesMarqueeBar";
import { RulesNarrativeSection } from "../narrative/RulesNarrativeSection";
import { WhatIsWoodySection } from "../narrative/WhatIsWoodySection";

/**
 * Landing narrativa — fluxo vertical contínuo (sem hero legacy).
 * Rota pública: `/landing`.
 *
 * Ordem das seções:
 * 1. O que é Woody?
 * 2. QR / tenha Woody na palma da sua mão
 * 3. Nossa missão
 * 4. O que não é legal fazer (Regras)
 * 5. Políticas
 * 6. Faixa marquee
 * 7. Footer
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[var(--woody-text)] antialiased selection:bg-[var(--woody-lime)]/25">
      <LandingHeader />
      <main>
        {/* 1. O que é Woody? */}
        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.oQueEWoody}>
          <WhatIsWoodySection embedInLanding />
        </NarrativeScrollSection>

        {/* 2. Nossa missão */}
        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.missao}>
          <MissionNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        {/* 3. O que não é legal fazer */}
        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.regras}>
          <RulesNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        {/* 4. Políticas */}
        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.politicas}>
          <PoliciesNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        {/* 5. QR — antes do footer */}
        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.mobileQr}>
          <MobileQrNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        {/* 6. Faixa marquee — logo acima do footer */}
        <RulesMarqueeBar animate />
      </main>

      <ScrollReveal enabled yOffset={12}>
        <LandingFooter />
      </ScrollReveal>
    </div>
  );
}
