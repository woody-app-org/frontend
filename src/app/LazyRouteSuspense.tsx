import { Suspense, type ReactNode } from "react";

/** Suspense mínimo para rotas lazy — loading coberto pelos route guards. */
export function LazyRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
