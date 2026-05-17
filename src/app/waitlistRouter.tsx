import { createBrowserRouter, Navigate } from "react-router-dom";
import { WaitlistFormPage } from "@/features/prelaunch/pages/WaitlistFormPage";
import { WaitlistErrorPage } from "@/features/prelaunch/pages/WaitlistErrorPage";
import { WaitlistShell } from "./WaitlistShell";

export const waitlistRouter = createBrowserRouter([
  {
    element: <WaitlistShell />,
    errorElement: <WaitlistErrorPage />,
    children: [
      { index: true, element: <WaitlistFormPage /> },
      // alias explícito — mostra o formulário sem redirecionar
      { path: "pre-inscricao", element: <WaitlistFormPage /> },
      // toda rota desconhecida volta para /
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
