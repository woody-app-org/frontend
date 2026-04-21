import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { AuthEntryPage } from "@/features/auth/pages/AuthEntryPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OnboardingProvider } from "@/features/auth/onboarding/OnboardingContext";
import { OnboardingFlow } from "@/features/auth/onboarding/OnboardingFlow";
import { OnboardingStepAccount } from "@/features/auth/onboarding/steps/OnboardingStepAccount";
import { OnboardingStepVerifyEmail } from "@/features/auth/onboarding/steps/OnboardingStepVerifyEmail";
import { OnboardingStepProfilePhoto } from "@/features/auth/onboarding/steps/OnboardingStepProfilePhoto";
import { OnboardingStepInterests } from "@/features/auth/onboarding/steps/OnboardingStepInterests";
import { OnboardingStepCommunities } from "@/features/auth/onboarding/steps/OnboardingStepCommunities";
import { OnboardingStepComplete } from "@/features/auth/onboarding/steps/OnboardingStepComplete";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { RootRedirect } from "@/app/RootRedirect";
import { CreatePostPage, FeedPage, PostDetailPage } from "@/features/feed";
import { ProfilePage } from "@/features/profile";
import { CommunitiesPage, CommunityDetailPage, CreateCommunityPage } from "@/features/communities";
import { AssinaturaCanceladaPage, AssinaturaSucessoPage, PlanosPage } from "@/features/subscription/pages";
import { ConversationsPage } from "@/features/messages";

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <RootRedirect /> },
      { path: "auth", element: <AuthEntryPage /> },
      { path: "auth/login", element: <LoginPage /> },
      { path: "auth/register", element: <Navigate to="/auth/onboarding/1" replace /> },
      {
        path: "auth/onboarding",
        element: (
          <OnboardingProvider>
            <OnboardingFlow />
          </OnboardingProvider>
        ),
        children: [
          { index: true, element: <Navigate to="1" replace /> },
          { path: "1", element: <OnboardingStepAccount /> },
          { path: "2", element: <OnboardingStepVerifyEmail /> },
          { path: "3", element: <OnboardingStepProfilePhoto /> },
          { path: "4", element: <OnboardingStepInterests /> },
          { path: "5", element: <OnboardingStepCommunities /> },
          { path: "6", element: <OnboardingStepComplete /> },
        ],
      },
      {
        path: "feed",
        element: (
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <ConversationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages/:conversationId",
        element: (
          <ProtectedRoute>
            <ConversationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "criar",
        element: (
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "posts/:postId",
        element: (
          <ProtectedRoute>
            <PostDetailPage />
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
      {
        path: "communities/nova",
        element: (
          <ProtectedRoute>
            <CreateCommunityPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "communities",
        element: (
          <ProtectedRoute>
            <CommunitiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "communities/:communitySlug",
        element: (
          <ProtectedRoute>
            <CommunityDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "assinatura/sucesso",
        element: (
          <ProtectedRoute>
            <AssinaturaSucessoPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "assinatura/cancelado",
        element: (
          <ProtectedRoute>
            <AssinaturaCanceladaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "planos",
        element: (
          <ProtectedRoute>
            <PlanosPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
