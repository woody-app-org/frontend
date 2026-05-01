import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface InstitutionalPolicyCardProps {
  badge: string;
  title: string;
  excerpt: string;
  to: string;
  className?: string;
}

export function InstitutionalPolicyCard({ badge, title, excerpt, to, className }: InstitutionalPolicyCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex h-full flex-col rounded-[1.75rem] bg-white px-7 py-9 transition-[transform,box-shadow] duration-300 md:rounded-[2rem] md:px-8 md:py-10",
        "hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-28px_rgba(10,10,10,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#556b2f]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e5e7eb]",
        className
      )}
    >
      <h2 className="text-center font-sans text-[0.72rem] font-extrabold uppercase leading-snug tracking-[0.06em] text-[var(--woody-ink)] sm:text-[0.78rem] md:text-[0.82rem]">
        {title}
      </h2>
      <span className="mt-3 text-center text-[11px] font-semibold tracking-[0.18em] text-[#8a6f4a]">{badge}</span>
      <p className="mt-6 flex-1 text-left font-serif text-[0.95rem] leading-[1.75] text-[var(--woody-ink)] md:text-[1rem]">
        {excerpt}
      </p>
      <span className="mt-9 inline-flex w-fit items-center self-center rounded-md bg-[#556b2f] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-[background-color,transform] group-hover:bg-[#627836]">
        Ler mais
      </span>
    </Link>
  );
}
