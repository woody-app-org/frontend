import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ScrollToTop } from "./ScrollToTop";
import { WoodyToaster } from "@/components/ui/woody-toaster";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { AuthEntryPage } from "@/features/auth/pages/AuthEntryPage";
import { IntroPage } from "@/features/auth/pages/IntroPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OnboardingProvider } from "@/features/auth/onboarding/OnboardingContext";
import { OnboardingFlow } from "@/features/auth/onboarding/OnboardingFlow";
import { OnboardingStepAccount } from "@/features/auth/onboarding/steps/OnboardingStepAccount";
import { OnboardingStepVerifyEmail } from "@/features/auth/onboarding/steps/OnboardingStepVerifyEmail";
import { OnboardingStepProfilePhoto } from "@/features/auth/onboarding/steps/OnboardingStepProfilePhoto";
import { OnboardingStepInterests } from "@/features/auth/onboarding/steps/OnboardingStepInterests";
import { OnboardingStepCommunities } from "@/features/auth/onboarding/steps/OnboardingStepCommunities";
import { OnboardingStepComplete } from "@/features/auth/onboarding/steps/OnboardingStepComplete";
import { ForgotPasswordFlow } from "@/features/auth/passwordReset/ForgotPasswordFlow";
import { ForgotPasswordRequestPage } from "@/features/auth/passwordReset/pages/ForgotPasswordRequestPage";
import { ForgotPasswordVerifyCodePage } from "@/features/auth/passwordReset/pages/ForgotPasswordVerifyCodePage";
import { ResetPasswordPage } from "@/features/auth/passwordReset/pages/ResetPasswordPage";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { CreatePostPage, FeedPage, PostDetailRoutePage } from "@/features/feed";
import { ProfilePage } from "@/features/profile";
import {
  CommunitiesPage,
  CommunityDetailPage,
  CreateCommunityPage,
} from "@/features/communities";
import { CommunityAdminDashboardPage } from "@/features/communities/pages/CommunityAdminDashboardPage";
import { AssinaturaCanceladaPage, AssinaturaSucessoPage, PlanosPage } from "@/features/subscription/pages";
import { ConversationsPage } from "@/features/messages";
import { LandingPage } from "@/features/landing";
import { InstitutionalLayout } from "@/features/landing/institutional/InstitutionalLayout";
import { InstitutionalHubPage } from "@/features/landing/institutional/pages/InstitutionalHubPage";
import { MissionPage } from "@/features/landing/institutional/pages/MissionPage";
import { MobileQrPage } from "@/features/landing/institutional/pages/MobileQrPage";
import { PoliciesIndexPage } from "@/features/landing/institutional/pages/PoliciesIndexPage";
import { PrivacyAndCookiesPage } from "@/features/landing/institutional/pages/PrivacyAndCookiesPage";
import { PolicyDetailPage } from "@/features/landing/institutional/pages/PolicyDetailPage";
import { RulesPage } from "@/features/landing/institutional/pages/RulesPage";
import { WhatIsWoodyPage } from "@/features/landing/institutional/pages/WhatIsWoodyPage";
import { BetaClosedGate } from "@/features/beta/components/BetaClosedGate";
import { BetaGatePage } from "@/features/beta/pages/BetaGatePage";
import { BetaInviteLinkPage } from "@/features/beta/pages/BetaInviteLinkPage";
import { VerificationDocumentPage } from "@/features/verification/pages/VerificationDocumentPage";
import { VerificationPendingPage } from "@/features/verification/pages/VerificationPendingPage";
import { VerificationRejectedPage } from "@/features/verification/pages/VerificationRejectedPage";
import { SuperAdminRoute } from "@/app/SuperAdminRoute";
import { AdminVerificationListPage } from "@/features/admin/verification/pages/AdminVerificationListPage";
import { AdminVerificationDetailPage } from "@/features/admin/verification/pages/AdminVerificationDetailPage";

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <WoodyToaster />
        <ScrollToTop />
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "invite", element: <BetaGatePage /> },
      { path: "beta", element: <Navigate to="/invite" replace /> },
      { path: "convite/:code", element: <BetaInviteLinkPage /> },
      { path: "invite/:code", element: <BetaInviteLinkPage /> },
      {
        index: true,
        element: <IntroPage />,
      },
      { path: "landing", element: <LandingPage /> },
      {
        path: "institutional",
        element: <InstitutionalLayout />,
        children: [
          { index: true, element: <InstitutionalHubPage /> },
          { path: "missao", element: <MissionPage /> },
          { path: "o-que-e-a-woody", element: <WhatIsWoodyPage /> },
          { path: "regras-e-comportamento", element: <RulesPage /> },
          { path: "politicas", element: <PoliciesIndexPage /> },
          { path: "politicas/:slug", element: <PolicyDetailPage /> },
          { path: "privacidade-e-cookies", element: <PrivacyAndCookiesPage /> },
          { path: "woody-no-celular", element: <MobileQrPage /> },
        ],
      },
      {
        path: "auth",
        element: (
          <BetaClosedGate>
            <AuthEntryPage />
          </BetaClosedGate>
        ),
      },
      {
        path: "auth/login",
        element: (
          <BetaClosedGate>
            <LoginPage />
          </BetaClosedGate>
        ),
      },
      {
        path: "auth/forgot-password",
        element: (
          <BetaClosedGate>
            <ForgotPasswordFlow />
          </BetaClosedGate>
        ),
        children: [
          { index: true, element: <ForgotPasswordRequestPage /> },
          { path: "verify", element: <ForgotPasswordVerifyCodePage /> },
          { path: "new-password", element: <ResetPasswordPage /> },
        ],
      },
      { path: "auth/register", element: <Navigate to="/auth/onboarding/1" replace /> },
      {
        path: "verification/document",
        element: (
          <ProtectedRoute requireVerified={false}>
            <VerificationDocumentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "verification/pending",
        element: (
          <ProtectedRoute requireVerified={false}>
            <VerificationPendingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "verification/rejected",
        element: (
          <ProtectedRoute requireVerified={false}>
            <VerificationRejectedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "auth/onboarding",
        element: (
          <BetaClosedGate>
            <OnboardingProvider>
              <OnboardingFlow />
            </OnboardingProvider>
          </BetaClosedGate>
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
        path: "posts/:publicId",
        element: <PostDetailRoutePage />,
      },
      { path: "home", element: <Navigate to="/feed" replace /> },
      {
        path: "profile/:username",
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
        path: "communities/:communitySlug/admin",
        element: (
          <ProtectedRoute>
            <CommunityAdminDashboardPage />
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
      {
        path: "admin/verification",
        element: (
          <SuperAdminRoute>
            <AdminVerificationListPage />
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/verification/:id",
        element: (
          <SuperAdminRoute>
            <AdminVerificationDetailPage />
          </SuperAdminRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
