import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { lazy, Suspense } from "react";
import { RouterProvider } from "react-router-dom";

// Vite substitui VITE_PUBLIC_LAUNCH_MODE por string literal em build time.
// O import dinâmico faz com que apenas o router do modo ativo seja incluído no bundle.
const launchMode = import.meta.env.VITE_PUBLIC_LAUNCH_MODE?.toString().trim();

const ActiveRouterProvider = lazy(async () => {
  if (launchMode === "waitlist_form") {
    const { waitlistRouter } = await import("./app/waitlistRouter");
    return { default: () => <RouterProvider router={waitlistRouter} /> };
  }
  if (launchMode === "coming_soon") {
    const { comingSoonRouter } = await import("./app/comingSoonRouter");
    return { default: () => <RouterProvider router={comingSoonRouter} /> };
  }
  const { router } = await import("./app/router");
  return { default: () => <RouterProvider router={router} /> };
});

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <ActiveRouterProvider />
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
