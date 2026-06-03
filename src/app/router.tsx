import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ScrollToTop } from "./ScrollToTop";
import { WoodyToaster } from "@/components/ui/woody-toaster";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { SuperAdminRoute } from "@/app/SuperAdminRoute";
import { BetaClosedGate } from "@/features/beta/components/BetaClosedGate";

// ─── Rotas críticas — importação estática (carregam no bundle inicial) ─────────
// São as páginas que os utilizadores autenticados visitam com maior frequência.
import { AuthEntryPage } from "@/features/auth/pages/AuthEntryPage";
import { IntroPage } from "@/features/auth/pages/IntroPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { FeedPage, PostDetailRoutePage, CreatePostPage } from "@/features/feed";
import { ProfilePage } from "@/features/profile";
import { CommunitiesPage, CommunityDetailPage } from "@/features/communities";
import { ConversationsPage } from "@/features/messages";

// ─── Rotas lazy — carregam só quando o utilizador as visita ───────────────────

// Onboarding (1× por conta, bundle separado dos 6 passos)
const OnboardingProvider = lazy(() =>
  import("@/features/auth/onboarding/OnboardingContext").then(m => ({ default: m.OnboardingProvider }))
);
const OnboardingFlow = lazy(() =>
  import("@/features/auth/onboarding/OnboardingFlow").then(m => ({ default: m.OnboardingFlow }))
);
const OnboardingStepAccount = lazy(() =>
  import("@/features/auth/onboarding/steps/OnboardingStepAccount").then(m => ({ default: m.OnboardingStepAccount }))
);
const OnboardingStepVerifyEmail = lazy(() =>
  import("@/features/auth/onboarding/steps/OnboardingStepVerifyEmail").then(m => ({ default: m.OnboardingStepVerifyEmail }))
);
const OnboardingStepProfilePhoto = lazy(() =>
  import("@/features/auth/onboarding/steps/OnboardingStepProfilePhoto").then(m => ({ default: m.OnboardingStepProfilePhoto }))
);
const OnboardingStepInterests = lazy(() =>
  import("@/features/auth/onboarding/steps/OnboardingStepInterests").then(m => ({ default: m.OnboardingStepInterests }))
);
const OnboardingStepCommunities = lazy(() =>
  import("@/features/auth/onboarding/steps/OnboardingStepCommunities").then(m => ({ default: m.OnboardingStepCommunities }))
);
const OnboardingStepComplete = lazy(() =>
  import("@/features/auth/onboarding/steps/OnboardingStepComplete").then(m => ({ default: m.OnboardingStepComplete }))
);

// Password reset (raramente usado)
const ForgotPasswordFlow = lazy(() =>
  import("@/features/auth/passwordReset/ForgotPasswordFlow").then(m => ({ default: m.ForgotPasswordFlow }))
);
const ForgotPasswordRequestPage = lazy(() =>
  import("@/features/auth/passwordReset/pages/ForgotPasswordRequestPage").then(m => ({ default: m.ForgotPasswordRequestPage }))
);
const ForgotPasswordVerifyCodePage = lazy(() =>
  import("@/features/auth/passwordReset/pages/ForgotPasswordVerifyCodePage").then(m => ({ default: m.ForgotPasswordVerifyCodePage }))
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/passwordReset/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage }))
);

// Verificação (usado apenas na primeira aprovação)
const VerificationDocumentPage = lazy(() =>
  import("@/features/verification/pages/VerificationDocumentPage").then(m => ({ default: m.VerificationDocumentPage }))
);
const VerificationPendingPage = lazy(() =>
  import("@/features/verification/pages/VerificationPendingPage").then(m => ({ default: m.VerificationPendingPage }))
);
const VerificationRejectedPage = lazy(() =>
  import("@/features/verification/pages/VerificationRejectedPage").then(m => ({ default: m.VerificationRejectedPage }))
);

// Beta gate (raramente necessário)
const BetaGatePage = lazy(() =>
  import("@/features/beta/pages/BetaGatePage").then(m => ({ default: m.BetaGatePage }))
);
const BetaInviteLinkPage = lazy(() =>
  import("@/features/beta/pages/BetaInviteLinkPage").then(m => ({ default: m.BetaInviteLinkPage }))
);

// Landing + Institucional (marketing, raramente visitadas por utilizadoras autenticadas)
const LandingPage = lazy(() =>
  import("@/features/landing").then(m => ({ default: m.LandingPage }))
);
const InstitutionalLayout = lazy(() =>
  import("@/features/landing/institutional/InstitutionalLayout").then(m => ({ default: m.InstitutionalLayout }))
);
const InstitutionalHubPage = lazy(() =>
  import("@/features/landing/institutional/pages/InstitutionalHubPage").then(m => ({ default: m.InstitutionalHubPage }))
);
const MissionPage = lazy(() =>
  import("@/features/landing/institutional/pages/MissionPage").then(m => ({ default: m.MissionPage }))
);
const MobileQrPage = lazy(() =>
  import("@/features/landing/institutional/pages/MobileQrPage").then(m => ({ default: m.MobileQrPage }))
);
const InstallPage = lazy(() =>
  import("@/features/landing/pwa/InstallPage").then(m => ({ default: m.InstallPage }))
);
const PoliciesIndexPage = lazy(() =>
  import("@/features/landing/institutional/pages/PoliciesIndexPage").then(m => ({ default: m.PoliciesIndexPage }))
);
const PrivacyAndCookiesPage = lazy(() =>
  import("@/features/landing/institutional/pages/PrivacyAndCookiesPage").then(m => ({ default: m.PrivacyAndCookiesPage }))
);
const PolicyDetailPage = lazy(() =>
  import("@/features/landing/institutional/pages/PolicyDetailPage").then(m => ({ default: m.PolicyDetailPage }))
);
const RulesPage = lazy(() =>
  import("@/features/landing/institutional/pages/RulesPage").then(m => ({ default: m.RulesPage }))
);
const WhatIsWoodyPage = lazy(() =>
  import("@/features/landing/institutional/pages/WhatIsWoodyPage").then(m => ({ default: m.WhatIsWoodyPage }))
);

// Comunidades — criação e admin (usados com menos frequência)
const CreateCommunityPage = lazy(() =>
  import("@/features/communities").then(m => ({ default: m.CreateCommunityPage }))
);
const CommunityAdminDashboardPage = lazy(() =>
  import("@/features/communities/pages/CommunityAdminDashboardPage").then(m => ({ default: m.CommunityAdminDashboardPage }))
);

// Subscrição (raramente visitada)
const PlanosPage = lazy(() =>
  import("@/features/subscription/pages").then(m => ({ default: m.PlanosPage }))
);
const AssinaturaSucessoPage = lazy(() =>
  import("@/features/subscription/pages").then(m => ({ default: m.AssinaturaSucessoPage }))
);
const AssinaturaCanceladaPage = lazy(() =>
  import("@/features/subscription/pages").then(m => ({ default: m.AssinaturaCanceladaPage }))
);

// Admin (SuperAdmin apenas — bundle totalmente separado)
const AdminVerificationListPage = lazy(() =>
  import("@/features/admin/verification/pages/AdminVerificationListPage").then(m => ({ default: m.AdminVerificationListPage }))
);
const AdminVerificationDetailPage = lazy(() =>
  import("@/features/admin/verification/pages/AdminVerificationDetailPage").then(m => ({ default: m.AdminVerificationDetailPage }))
);
const AdminReportsListPage = lazy(() =>
  import("@/features/admin/reports/pages/AdminReportsListPage").then(m => ({ default: m.AdminReportsListPage }))
);
const AdminReportDetailPage = lazy(() =>
  import("@/features/admin/reports/pages/AdminReportDetailPage").then(m => ({ default: m.AdminReportDetailPage }))
);
const SupportPage = lazy(() =>
  import("@/features/support/pages/SupportPage").then(m => ({ default: m.SupportPage }))
);
const SupportNewPage = lazy(() =>
  import("@/features/support/pages/SupportNewPage").then(m => ({ default: m.SupportNewPage }))
);
const SupportDetailPage = lazy(() =>
  import("@/features/support/pages/SupportDetailPage").then(m => ({ default: m.SupportDetailPage }))
);
const BanAppealPage = lazy(() =>
  import("@/features/support/pages/BanAppealPage").then(m => ({ default: m.BanAppealPage }))
);
const AdminSupportListPage = lazy(() =>
  import("@/features/admin/support/pages/AdminSupportListPage").then(m => ({ default: m.AdminSupportListPage }))
);
const AdminSupportDetailPage = lazy(() =>
  import("@/features/admin/support/pages/AdminSupportDetailPage").then(m => ({ default: m.AdminSupportDetailPage }))
);

// ─── Wrapper Suspense mínimo (guarda de loading existente nos guards já cobre) ─
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

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
      { path: "invite", element: <S><BetaGatePage /></S> },
      { path: "beta", element: <Navigate to="/invite" replace /> },
      { path: "convite/:code", element: <S><BetaInviteLinkPage /></S> },
      { path: "invite/:code", element: <S><BetaInviteLinkPage /></S> },
      { index: true, element: <IntroPage /> },
      { path: "landing", element: <S><LandingPage /></S> },
      { path: "install", element: <S><InstallPage /></S> },
      {
        path: "institutional",
        element: <S><InstitutionalLayout /></S>,
        children: [
          { index: true, element: <S><InstitutionalHubPage /></S> },
          { path: "missao", element: <S><MissionPage /></S> },
          { path: "o-que-e-a-woody", element: <S><WhatIsWoodyPage /></S> },
          { path: "regras-e-comportamento", element: <S><RulesPage /></S> },
          { path: "politicas", element: <S><PoliciesIndexPage /></S> },
          { path: "politicas/:slug", element: <S><PolicyDetailPage /></S> },
          { path: "privacidade-e-cookies", element: <S><PrivacyAndCookiesPage /></S> },
          { path: "woody-no-celular", element: <S><MobileQrPage /></S> },
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
        path: "support/ban-appeal",
        element: (
          <BetaClosedGate>
            <S><BanAppealPage /></S>
          </BetaClosedGate>
        ),
      },
      {
        path: "auth/forgot-password",
        element: (
          <BetaClosedGate>
            <S><ForgotPasswordFlow /></S>
          </BetaClosedGate>
        ),
        children: [
          { index: true, element: <S><ForgotPasswordRequestPage /></S> },
          { path: "verify", element: <S><ForgotPasswordVerifyCodePage /></S> },
          { path: "new-password", element: <S><ResetPasswordPage /></S> },
        ],
      },
      { path: "auth/register", element: <Navigate to="/auth/onboarding/1" replace /> },
      {
        path: "verification/document",
        element: (
          <ProtectedRoute requireVerified={false}>
            <S><VerificationDocumentPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "verification/pending",
        element: (
          <ProtectedRoute requireVerified={false}>
            <S><VerificationPendingPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "verification/rejected",
        element: (
          <ProtectedRoute requireVerified={false}>
            <S><VerificationRejectedPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "auth/onboarding",
        element: (
          <BetaClosedGate>
            <S>
              <OnboardingProvider>
                <OnboardingFlow />
              </OnboardingProvider>
            </S>
          </BetaClosedGate>
        ),
        children: [
          { index: true, element: <Navigate to="1" replace /> },
          { path: "1", element: <S><OnboardingStepAccount /></S> },
          { path: "2", element: <S><OnboardingStepVerifyEmail /></S> },
          { path: "3", element: <S><OnboardingStepProfilePhoto /></S> },
          { path: "4", element: <S><OnboardingStepInterests /></S> },
          { path: "5", element: <S><OnboardingStepCommunities /></S> },
          { path: "6", element: <S><OnboardingStepComplete /></S> },
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
            <S><CreateCommunityPage /></S>
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
            <S><CommunityAdminDashboardPage /></S>
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
            <S><AssinaturaSucessoPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "assinatura/cancelado",
        element: (
          <ProtectedRoute>
            <S><AssinaturaCanceladaPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "planos",
        element: (
          <ProtectedRoute>
            <S><PlanosPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "support",
        element: (
          <ProtectedRoute requireVerified={false}>
            <S><SupportPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "support/new",
        element: (
          <ProtectedRoute requireVerified={false}>
            <S><SupportNewPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "support/:publicId",
        element: (
          <ProtectedRoute requireVerified={false}>
            <S><SupportDetailPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/verification",
        element: (
          <SuperAdminRoute>
            <S><AdminVerificationListPage /></S>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/verification/:id",
        element: (
          <SuperAdminRoute>
            <S><AdminVerificationDetailPage /></S>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/reports",
        element: (
          <SuperAdminRoute>
            <S><AdminReportsListPage /></S>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/reports/:id",
        element: (
          <SuperAdminRoute>
            <S><AdminReportDetailPage /></S>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/support",
        element: (
          <SuperAdminRoute>
            <S><AdminSupportListPage /></S>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/support/:publicId",
        element: (
          <SuperAdminRoute>
            <S><AdminSupportDetailPage /></S>
          </SuperAdminRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
