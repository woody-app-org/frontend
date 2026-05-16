import { Outlet } from "react-router-dom";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHeader } from "../components/LandingHeader";

/** Shell com header e footer da landing, para páginas institucionais. */
export function InstitutionalLayout() {
  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#f4f2ec_0%,#f0efe8_55%,#ebe8df_100%)] text-[var(--woody-ink)]">
      <LandingHeader />
      <Outlet />
      <LandingFooter />
    </div>
  );
}
