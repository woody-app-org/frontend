import { lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { LazyRouteSuspense } from "./LazyRouteSuspense";
import { RouteErrorBoundary } from "./RouteErrorBoundary";
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

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <WoodyToaster />
        <ScrollToTop />
        <Outlet />
      </AuthProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "invite", element: <LazyRouteSuspense><BetaGatePage /></LazyRouteSuspense> },
      { path: "beta", element: <Navigate to="/invite" replace /> },
      { path: "convite/:code", element: <LazyRouteSuspense><BetaInviteLinkPage /></LazyRouteSuspense> },
      { path: "invite/:code", element: <LazyRouteSuspense><BetaInviteLinkPage /></LazyRouteSuspense> },
      { index: true, element: <IntroPage /> },
      { path: "landing", element: <LazyRouteSuspense><LandingPage /></LazyRouteSuspense> },
      { path: "cookies-e-tecnologias-locais", element: <Navigate to="/institutional/privacidade-e-cookies" replace /> },
      { path: "install", element: <LazyRouteSuspense><InstallPage /></LazyRouteSuspense> },
      {
        path: "institutional",
        element: <LazyRouteSuspense><InstitutionalLayout /></LazyRouteSuspense>,
        children: [
          { index: true, element: <LazyRouteSuspense><InstitutionalHubPage /></LazyRouteSuspense> },
          { path: "missao", element: <LazyRouteSuspense><MissionPage /></LazyRouteSuspense> },
          { path: "o-que-e-a-woody", element: <LazyRouteSuspense><WhatIsWoodyPage /></LazyRouteSuspense> },
          { path: "regras-e-comportamento", element: <LazyRouteSuspense><RulesPage /></LazyRouteSuspense> },
          { path: "politicas", element: <LazyRouteSuspense><PoliciesIndexPage /></LazyRouteSuspense> },
          { path: "politicas/:slug", element: <LazyRouteSuspense><PolicyDetailPage /></LazyRouteSuspense> },
          { path: "privacidade-e-cookies", element: <LazyRouteSuspense><PrivacyAndCookiesPage /></LazyRouteSuspense> },
          { path: "woody-no-celular", element: <LazyRouteSuspense><MobileQrPage /></LazyRouteSuspense> },
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
            <LazyRouteSuspense><BanAppealPage /></LazyRouteSuspense>
          </BetaClosedGate>
        ),
      },
      {
        path: "auth/forgot-password",
        element: (
          <BetaClosedGate>
            <LazyRouteSuspense><ForgotPasswordFlow /></LazyRouteSuspense>
          </BetaClosedGate>
        ),
        children: [
          { index: true, element: <LazyRouteSuspense><ForgotPasswordRequestPage /></LazyRouteSuspense> },
          { path: "verify", element: <LazyRouteSuspense><ForgotPasswordVerifyCodePage /></LazyRouteSuspense> },
          { path: "new-password", element: <LazyRouteSuspense><ResetPasswordPage /></LazyRouteSuspense> },
        ],
      },
      { path: "auth/register", element: <Navigate to="/auth/onboarding/1" replace /> },
      {
        path: "verification/document",
        element: (
          <ProtectedRoute requireVerified={false}>
            <LazyRouteSuspense><VerificationDocumentPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "verification/pending",
        element: (
          <ProtectedRoute requireVerified={false}>
            <LazyRouteSuspense><VerificationPendingPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "verification/rejected",
        element: (
          <ProtectedRoute requireVerified={false}>
            <LazyRouteSuspense><VerificationRejectedPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "auth/onboarding",
        element: (
          <BetaClosedGate>
            <LazyRouteSuspense>
              <OnboardingProvider>
                <OnboardingFlow />
              </OnboardingProvider>
            </LazyRouteSuspense>
          </BetaClosedGate>
        ),
        children: [
          { index: true, element: <Navigate to="1" replace /> },
          { path: "1", element: <LazyRouteSuspense><OnboardingStepAccount /></LazyRouteSuspense> },
          { path: "2", element: <LazyRouteSuspense><OnboardingStepVerifyEmail /></LazyRouteSuspense> },
          { path: "3", element: <LazyRouteSuspense><OnboardingStepProfilePhoto /></LazyRouteSuspense> },
          { path: "4", element: <LazyRouteSuspense><OnboardingStepInterests /></LazyRouteSuspense> },
          { path: "5", element: <LazyRouteSuspense><OnboardingStepCommunities /></LazyRouteSuspense> },
          { path: "6", element: <LazyRouteSuspense><OnboardingStepComplete /></LazyRouteSuspense> },
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
            <LazyRouteSuspense><CreateCommunityPage /></LazyRouteSuspense>
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
            <LazyRouteSuspense><CommunityAdminDashboardPage /></LazyRouteSuspense>
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
            <LazyRouteSuspense><AssinaturaSucessoPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "assinatura/cancelado",
        element: (
          <ProtectedRoute>
            <LazyRouteSuspense><AssinaturaCanceladaPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "planos",
        element: (
          <ProtectedRoute>
            <LazyRouteSuspense><PlanosPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "support",
        element: (
          <ProtectedRoute requireVerified={false}>
            <LazyRouteSuspense><SupportPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "support/new",
        element: (
          <ProtectedRoute requireVerified={false}>
            <LazyRouteSuspense><SupportNewPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "support/:publicId",
        element: (
          <ProtectedRoute requireVerified={false}>
            <LazyRouteSuspense><SupportDetailPage /></LazyRouteSuspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/verification",
        element: (
          <SuperAdminRoute>
            <LazyRouteSuspense><AdminVerificationListPage /></LazyRouteSuspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/verification/:id",
        element: (
          <SuperAdminRoute>
            <LazyRouteSuspense><AdminVerificationDetailPage /></LazyRouteSuspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/reports",
        element: (
          <SuperAdminRoute>
            <LazyRouteSuspense><AdminReportsListPage /></LazyRouteSuspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/reports/:id",
        element: (
          <SuperAdminRoute>
            <LazyRouteSuspense><AdminReportDetailPage /></LazyRouteSuspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/support",
        element: (
          <SuperAdminRoute>
            <LazyRouteSuspense><AdminSupportListPage /></LazyRouteSuspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: "admin/support/:publicId",
        element: (
          <SuperAdminRoute>
            <LazyRouteSuspense><AdminSupportDetailPage /></LazyRouteSuspense>
          </SuperAdminRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
