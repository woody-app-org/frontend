import { lazy, Suspense } from "react";
import { RouterProvider } from "react-router-dom";

// Vite substitui VITE_PUBLIC_LAUNCH_MODE por string literal em build time.
// O import dinâmico faz com que apenas o router do modo ativo seja incluído no bundle.
const isWaitlistBuild =
  import.meta.env.VITE_PUBLIC_LAUNCH_MODE === "waitlist_form";

const ActiveRouterProvider = lazy(async () => {
  if (isWaitlistBuild) {
    const { waitlistRouter } = await import("./app/waitlistRouter");
    return { default: () => <RouterProvider router={waitlistRouter} /> };
  }
  const { router } = await import("./app/router");
  return { default: () => <RouterProvider router={router} /> };
});

function App() {
  return (
    <Suspense fallback={null}>
      <ActiveRouterProvider />
    </Suspense>
  );
}

export default App;