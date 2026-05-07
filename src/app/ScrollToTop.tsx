import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Em SPA, o browser não repõe o scroll ao mudar de rota — ao sair de páginas longas
 * (ex.: landing) o `scrollY` anterior pode ficar “colado” e mostrar o fim do novo ecrã.
 * Também honra `#âncoras` quando existem.
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      if (id) {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
