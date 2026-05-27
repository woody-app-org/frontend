import { rules } from "../institutional/content";

export interface RulesHeroTitleProps {
  /** Quebras editoriais como no mockup (4 linhas). */
  multiline?: boolean;
}

/** Título das regras — sublinha a palavra «legal» independentemente de caixa. */
export function RulesHeroTitle({ multiline = false }: RulesHeroTitleProps) {
  const t = rules.title;
  const idx = t.toLowerCase().indexOf("legal");

  if (multiline) {
    return (
      <>
        O que não
        <br />é{" "}
        <span className="underline decoration-2 underline-offset-[0.18em]">legal</span>
        <br />
        fazer na
        <br />
        Woody
      </>
    );
  }

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
