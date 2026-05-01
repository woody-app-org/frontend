import { rules } from "../institutional/content";

/** Título hero das regras com sublinhado editorial na palavra «legal». */
export function RulesHeroTitle() {
  const t = rules.title;
  const idx = t.toLowerCase().indexOf("legal");
  if (idx === -1) {
    return <span>{t}</span>;
  }
  const before = t.slice(0, idx);
  const word = t.slice(idx, idx + 5);
  const after = t.slice(idx + 5);
  return (
    <>
      {before}
      <span className="underline decoration-2 underline-offset-[0.18em]">{word}</span>
      {after}
    </>
  );
}
