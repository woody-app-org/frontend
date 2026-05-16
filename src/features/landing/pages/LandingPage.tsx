import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { ScrollReveal } from "../motion/ScrollReveal";
import { LANDING_NARRATIVE_IDS } from "../constants";
import { MissionNarrativeSection } from "../narrative/MissionNarrativeSection";
import { MobileQrNarrativeSection } from "../narrative/MobileQrNarrativeSection";
import { NarrativeScrollSection } from "../narrative/NarrativeScrollSection";
import { PoliciesNarrativeSection } from "../narrative/PoliciesNarrativeSection";
import { RulesNarrativeSection } from "../narrative/RulesNarrativeSection";
import { WhatIsWoodySection } from "../narrative/WhatIsWoodySection";

/**
 * Landing narrativa — fluxo vertical contínuo (sem hero legacy).
 * Rota pública: `/landing`.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f2ec] text-[var(--woody-text)] antialiased selection:bg-[var(--woody-lime)]/25">
      <LandingHeader />
      <main>
        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.oQueEWoody}>
          <WhatIsWoodySection embedInLanding />
        </NarrativeScrollSection>

        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.missao}>
          <MissionNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.regras}>
          <RulesNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.politicas}>
          <PoliciesNarrativeSection embedInLanding />
        </NarrativeScrollSection>

        <NarrativeScrollSection id={LANDING_NARRATIVE_IDS.mobileQr}>
          <MobileQrNarrativeSection embedInLanding />
        </NarrativeScrollSection>
      </main>
      <ScrollReveal enabled yOffset={12}>
        <LandingFooter />
      </ScrollReveal>
    </div>
  );
}
