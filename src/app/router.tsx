import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { RootRedirect } from "@/app/RootRedirect";
import { FeedPage } from "@/features/feed";
import { ProfilePage } from "@/features/profile";

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <RootRedirect /> },
      { path: "auth", element: <AuthPage /> },
      { path: "auth/register", element: <AuthPage /> },
      {
        path: "feed",
        element: (
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        ),
      },
      { path: "home", element: <Navigate to="/feed" replace /> },
      {
        path: "profile/:userId",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
