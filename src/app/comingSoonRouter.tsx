import { createBrowserRouter, Navigate } from "react-router-dom";
import { LaunchClosedPage } from "@/features/prelaunch/pages/LaunchClosedPage";
import { WaitlistErrorPage } from "@/features/prelaunch/pages/WaitlistErrorPage";
import { WaitlistShell } from "./WaitlistShell";

export const comingSoonRouter = createBrowserRouter([
  {
    element: <WaitlistShell />,
    errorElement: <WaitlistErrorPage />,
    children: [
      { index: true, element: <LaunchClosedPage /> },
      { path: "pre-inscricao", element: <LaunchClosedPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
