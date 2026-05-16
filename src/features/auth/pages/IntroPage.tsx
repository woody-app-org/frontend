import { startTransition, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { WoodyLogo } from "@/components/branding/WoodyLogo";
import { useAuth } from "../context/AuthContext";

const INTRO_DURATION_MS = 2200;

/**
 * Primeira impressão da aplicação no `/`: logo oficial e, em seguida, landing institucional.
 * Com sessão ativa, o fluxo ignora a intro e segue direto para o feed.
 */
export function IntroPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    startTransition(() => {
      setIsVisible(true);
    });
    const t = window.setTimeout(() => {
      navigate("/landing", { replace: true });
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[var(--woody-text)]">
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-5">
        <div className={`flex flex-col items-center transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <WoodyLogo className="w-[min(92vw,560px)] max-w-full md:w-[min(82vw,640px)] lg:w-[min(72vw,720px)]" />
        </div>
      </section>
    </main>
  );
}
