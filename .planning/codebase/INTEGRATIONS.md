# External Integrations

**Analysis Date:** Monday Apr 27, 2026

## APIs & External Services

**Backend REST API:**
- Woody backend API - primary application API for auth, feed, posts, profiles, communities, search, reports, billing, and messages.
  - SDK/Client: `axios` through shared client `api` in `src/lib/api.ts`.
  - Auth: JWT bearer token from `localStorage` key `woody_auth_token` via `AUTH_TOKEN_KEY` in `src/features/auth/constants.ts`.
  - Base URL: `VITE_API_BASE_URL`, normalized to end in `/api` by `src/lib/api.ts`; development fallback is `http://localhost:5000/api`.
  - Error extraction: `getApiErrorMessage()` in `src/lib/api.ts` handles ASP.NET-style response bodies, `ProblemDetails`, and common status codes.

**Real-time messaging:**
- ASP.NET SignalR direct-message hub - real-time inbox and conversation updates.
  - SDK/Client: `@microsoft/signalr` in `src/features/messages/hooks/useDirectMessagesSignalR.ts`.
  - Hub URL: `${getApiOrigin()}/hubs/direct-messages`, derived from REST API origin in `src/lib/api.ts`.
  - Auth: `accessTokenFactory` reads the same JWT from `getStoredToken()` in `src/lib/api.ts`.
  - Events consumed: `messageCreated`, `messageUpdated`, `messageDeleted`, `conversationUpdated`, and `inboxChanged`.
  - Server methods invoked: `JoinUserInbox`, `JoinConversation`, and `LeaveConversation`.

**Stripe via backend:**
- Stripe Checkout and Customer Portal - frontend never talks to Stripe SDK directly; it asks the backend for redirect URLs.
  - SDK/Client: none in browser; uses `api.post()` from `src/lib/api.ts`.
  - Subscription checkout: `Billing/checkout/subscription` in `src/features/subscription/services/billingCheckout.service.ts`.
  - Community premium checkout: `Billing/checkout/community-premium` in `src/features/subscription/services/billingCheckout.service.ts`.
  - Billing portal: `Billing/portal/session` in `src/features/subscription/services/billingPortal.service.ts`.
  - Redirect behavior: `window.location.assign(url)` in `src/features/subscription/hooks/useProCheckout.ts` and `src/features/subscription/hooks/useStripeCustomerPortal.ts`.

**External assets/CDNs:**
- Google Fonts - `Lora` and `Plus Jakarta Sans` loaded in `index.html`.
- Unsplash image URLs - mock/seed image data in `src/domain/mocks/seed-data.ts` and `src/features/profile/mocks/profile.mock.ts`.

## Backend Endpoint Surface

**Authentication and account:**
- `Auth/login`, `Auth/register`, and `Auth/logout` in `src/features/auth/services/auth.service.ts`.
- `Auth/send-verification`, `Auth/resend-verification`, and `Auth/verify-email` in `src/features/auth/onboarding/services/emailVerification.service.ts`.
- `users/me` for current user and subscription state in `src/features/auth/services/auth.service.ts` and `src/features/profile/hooks/useMeComposerUser.ts`.
- `users/me` profile update in `src/features/profile/services/profile.service.ts`.

**Feed, posts, comments, and moderation:**
- `feed` in `src/features/feed/services/feed.service.ts`.
- `posts`, `posts/{postId}`, `posts/{postId}/comments`, and `posts/{postId}/like` in `src/features/feed/services/post.service.ts` and `src/domain/services/postMock.service.ts`.
- Profile/comment pinning endpoints in `src/features/feed/services/postPin.service.ts`.
- Post/comment moderation and reporting endpoints in `src/domain/services/contentModerationMock.service.ts`, including `reports` and comment hiding.

**Profiles, follows, and social discovery:**
- `users/{userId}`, `users/{userId}/posts`, `users/{userId}/followers`, `users/{userId}/following`, and `users/{userId}/follow/status` in `src/features/profile/services`.
- `users/me/following`, `users/me/suggestions`, and `users/{userId}/communities` in `src/features/users/services/userSocial.service.ts`.

**Communities:**
- `communities`, `communities/by-slug/{slug}`, `communities/{communityId}`, `communities/{communityId}/posts`, `communities/{communityId}/members`, and `communities/{communityId}/members/me` in `src/features/communities/services/community.service.ts`.
- Community membership and join request actions in `src/features/communities/services/communityMembership.service.ts`, including `join-requests/{joinRequestId}/approve` and `join-requests/{joinRequestId}/reject`.
- Premium community dashboard and boost endpoints in `src/features/communities/services/community.service.ts`.

**Messages:**
- `conversations`, `conversations/pending-received`, `conversations/{conversationId}/messages`, `conversations/{conversationId}/accept`, and `conversations/{conversationId}/reject` in `src/features/messages/services/messages.service.ts`.

**Search:**
- `search` with `q` and `mode` params in `src/features/search/services/search.service.ts`.

## Data Storage

**Databases:**
- Not directly accessed by the frontend.
- Backend-managed persistence is implied by REST endpoints in `src/features/**/services` and `src/domain/services`.

**File Storage:**
- No direct file-storage SDK detected.
- Image inputs are represented as public URLs in UI fields, for example the image URL placeholder in `src/features/feed/components/PostComposerForm.tsx`.

**Caching:**
- No React Query, SWR, Apollo, Redux Toolkit Query, service worker cache, or browser cache layer detected.
- Component and hook state are used locally; persistence is limited to `localStorage` and `sessionStorage`.

**Local browser storage:**
- `localStorage` stores the JWT token under `woody_auth_token` and serialized auth user under `woody_auth_user` through `src/lib/api.ts` and `src/features/auth/services/auth.service.ts`.
- `sessionStorage` stores onboarding draft data under `woody_onboarding_draft` through `src/features/auth/onboarding/onboarding.storage.ts`.

## Authentication & Identity

**Auth Provider:**
- Custom JWT authentication backed by Woody API endpoints.
  - Implementation: `AuthProvider` in `src/features/auth/context/AuthContext.tsx` owns authenticated user state and exposes `login`, `register`, `logout`, `logoutAsync`, and `patchUser`.
  - Login/register: `src/features/auth/services/auth.service.ts` posts credentials to backend auth endpoints, stores returned JWT/user, and syncs the display patch store.
  - Request auth: Axios request interceptor in `src/lib/api.ts` attaches `Authorization: Bearer <token>`.
  - Protected routes: `ProtectedRoute` wraps authenticated pages in `src/app/router.tsx`.
  - Session restoration: `AuthProvider` initializes from `localStorage` via `getAuthUser()`.

## Monitoring & Observability

**Error Tracking:**
- None detected - no Sentry, Datadog, LogRocket, OpenTelemetry, or analytics package in `package.json`.

**Logs:**
- SignalR client logging uses `signalR.LogLevel.Warning` in `src/features/messages/hooks/useDirectMessagesSignalR.ts`.
- No central frontend logging abstraction detected.

## CI/CD & Deployment

**Hosting:**
- Vercel-style static SPA deployment is indicated by `vercel.json`, which rewrites all routes to `/index.html`.

**CI Pipeline:**
- Not detected - no workflow files inspected or detected in the focused scan.

## Environment Configuration

**Required env vars:**
- `VITE_API_BASE_URL` - required for non-development builds by `src/lib/api.ts`; may include either the API host or a URL already ending in `/api`.

**Secrets location:**
- `.env.example` and `.env.development` are present in the frontend repo; contents were not read.
- Frontend Vite variables are build-time public variables. Do not place secrets in `VITE_*` values.

## Webhooks & Callbacks

**Incoming:**
- None detected in the frontend. Stripe checkout, customer portal, and webhook handling appear backend-owned.

**Outgoing:**
- Browser redirects to backend-provided Stripe Checkout and Billing Portal URLs via `window.location.assign()` in subscription hooks.
- SignalR client opens outgoing WebSocket/LongPolling connections to `/hubs/direct-messages`.

## Integration Patterns

**HTTP client pattern:**
- Import `api` from `src/lib/api.ts` in feature services.
- Use feature-specific service modules under `src/features/**/services` for backend calls.
- Use relative API paths so the Axios `baseURL` keeps the `/api` prefix; `src/lib/api.ts` strips a leading slash defensively before requests.
- Map raw backend DTOs to domain objects with mappers from `src/lib/apiMappers.ts`.

**Error handling pattern:**
- Convert Axios/backend errors to user-facing Portuguese messages with `getApiErrorMessage()` from `src/lib/api.ts`.
- Some feature services preserve typed result objects for UI behavior, such as `ContentModerationResult` in `src/domain/services/contentModerationMock.service.ts`.

**Session pattern:**
- Treat `localStorage` as the session source of truth for page refreshes.
- Keep in-memory auth state in `AuthProvider`.
- Use `getStoredToken()` for both Axios bearer tokens and SignalR `accessTokenFactory`.

---

*Integration audit: Monday Apr 27, 2026*
