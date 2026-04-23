import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LANDING_IDS } from "../constants";

const nav = [
  { label: "Como funciona", href: `#${LANDING_IDS.comoFunciona}` },
  { label: "Comunidades", href: `#${LANDING_IDS.comunidades}` },
  { label: "Recursos", href: `#${LANDING_IDS.recursos}` },
  { label: "Planos", href: `#${LANDING_IDS.planos}` },
  { label: "Segurança", href: `#${LANDING_IDS.seguranca}` },
] as const;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-black/[0.06] bg-[#f4f2ec]/92 shadow-[0_1px_0_rgba(10,10,10,0.04)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[var(--layout-max-width)] items-center justify-between gap-6 px-[var(--layout-gutter)]">
        <Link
          to="/landing"
          className="group flex shrink-0 items-baseline gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-lime)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f2ec]"
        >
          <span className="font-serif text-xl font-semibold tracking-tight text-[var(--woody-ink)] md:text-2xl">
            Woody
          </span>
          <span
            className="font-serif text-xl font-semibold text-[var(--woody-lime)] md:text-2xl"
            aria-hidden
          >
            .
          </span>
        </Link>

        <nav
          className="hidden items-center gap-9 text-[13px] font-semibold tracking-tight text-[var(--woody-text)]/68 lg:flex"
          aria-label="Navegação principal"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--woody-lime)] after:transition-transform after:content-[''] hover:text-[var(--woody-ink)] hover:after:scale-x-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" className="hidden text-[var(--woody-muted)] sm:inline-flex" asChild>
            <Link to="/auth/login">Entrar</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-[var(--woody-ink)] px-4 font-semibold text-[var(--woody-lime)] shadow-[0_0_0_1px_rgba(139,195,74,0.35),0_8px_24px_rgba(139,195,74,0.18)] hover:bg-black"
            asChild
          >
            <Link to="/auth/onboarding/1">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
