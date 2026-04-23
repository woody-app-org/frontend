import { LandingAbout } from "../components/LandingAbout";
import { LandingCommunities } from "../components/LandingCommunities";
import { LandingFeatures } from "../components/LandingFeatures";
import { LandingFinalCta } from "../components/LandingFinalCta";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";
import { LandingHero } from "../components/LandingHero";
import { LandingHowItWorks } from "../components/LandingHowItWorks";
import { LandingPricing } from "../components/LandingPricing";
import { LandingSecurity } from "../components/LandingSecurity";
import { LandingShowcase } from "../components/LandingShowcase";

/**
 * Landing institucional da Woody — editorial, premium, alinhada ao design system existente.
 * Rota pública: `/landing`.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f2ec] text-[var(--woody-text)] antialiased selection:bg-[var(--woody-lime)]/25">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingAbout />
        <LandingFeatures />
        <LandingSecurity />
        <LandingCommunities />
        <LandingPricing />
        <LandingHowItWorks />
        <LandingShowcase />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
