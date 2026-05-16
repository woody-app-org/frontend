# Codebase Concerns

**Analysis Date:** Monday Apr 27, 2026

## Tech Debt

**High - Mock naming and mock stores remain in production paths:**
- Issue: API-backed flows still expose `Mock` names and depend on local mock stores/subscriptions for UI state propagation. This makes boundaries unclear and increases the chance of preserving mock-only behavior while integrating new backend endpoints.
- Files: `src/domain/services/postMock.service.ts`, `src/domain/services/contentModerationMock.service.ts`, `src/domain/mocks/postInteractionMockStore.ts`, `src/domain/mocks/userDisplayPatchStore.ts`, `src/domain/mocks/communityDraftStore.ts`, `src/features/feed/hooks/useFeed.ts`, `src/features/auth/services/auth.service.ts`
- Impact: New work can call mock contracts by mistake, optimistic UI state can diverge from server truth, and API migration tasks need extra inspection to separate real backend behavior from in-memory client mirrors.
- Fix approach: Rename API-backed services away from `Mock`, isolate remaining in-memory compatibility stores behind explicit adapters, and retire exports from `src/domain/index.ts` that expose mock internals to feature code.

**High - Client-side session and auth state are stored in browser storage:**
- Issue: JWT and user profile data are read from and written to `localStorage`; onboarding draft data is written to `sessionStorage`.
- Files: `src/lib/api.ts`, `src/features/auth/services/auth.service.ts`, `src/features/auth/context/AuthContext.tsx`, `src/features/auth/onboarding/onboarding.storage.ts`, `src/features/auth/onboarding/types.ts`
- Impact: XSS would expose bearer tokens and profile/session data. Onboarding explicitly includes sensitive registration data, and the code comment in `src/features/auth/onboarding/types.ts` states that password/CPF must not be persisted in production.
- Fix approach: Move session ownership to server-managed HTTP-only cookies or a backend-backed onboarding session. Keep browser storage only for non-sensitive UI preferences.

**Medium - Silent fallback/error swallowing hides backend and permission failures:**
- Issue: Several service calls catch errors and return empty/null states without surfacing diagnostics or preserving the failure reason.
- Files: `src/features/communities/services/community.service.ts`, `src/features/communities/pages/CommunityAdminDashboardPage.tsx`, `src/domain/services/postMock.service.ts`, `src/features/feed/hooks/usePostDetail.ts`, `src/features/messages/hooks/useDirectMessagesSignalR.ts`
- Impact: Users can see empty lists or stale UI when backend requests fail, while developers lose evidence needed to distinguish "no data" from "request failed".
- Fix approach: Return explicit typed states such as `ok/error/empty`, log non-sensitive diagnostics in development, and expose retry affordances where empty results are currently used as fallback.

**Medium - Large feature components concentrate UI, data loading, and interaction logic:**
- Issue: Several files exceed 300 lines and mix view rendering, data fetching, formatting, and event handling.
- Files: `src/features/communities/pages/CommunityAdminDashboardPage.tsx`, `src/features/feed/components/PostComposerForm.tsx`, `src/features/communities/pages/CommunityDetailPage.tsx`, `src/features/profile/components/EditProfileDialog.tsx`, `src/features/communities/services/community.service.ts`, `src/features/feed/components/PostCard.tsx`, `src/features/messages/pages/ConversationsPage.tsx`
- Impact: Changes to analytics, composer behavior, community detail, profile editing, and messaging have high regression risk because small UI edits can affect data loading and state transitions.
- Fix approach: Extract formatters, service orchestration hooks, and presentational subcomponents before adding behavior to these files.

**Low - Lint suppressions and broad API record typing exist in a few hot paths:**
- Issue: `eslint-disable` is used for React Fast Refresh exports and `Record<string, any>` is used for API mapping.
- Files: `src/components/ui/button.tsx`, `src/features/feed/context/CreatePostComposerContext.tsx`, `src/features/auth/context/AuthContext.tsx`, `src/features/auth/onboarding/steps/OnboardingStepCommunities.tsx`, `src/lib/apiMappers.ts`
- Impact: The suppressions appear intentional, but mapper typing can let backend DTO drift reach runtime silently.
- Fix approach: Keep Fast Refresh suppressions local and documented. Replace broad mapper records with narrow DTO types or Zod parsing for high-risk API responses.

## Known Bugs

**Pin actions are placeholders:**
- Symptoms: Pin callbacks write to the console instead of invoking a real mutation or showing a disabled state.
- Files: `src/features/feed/pages/FeedPage.tsx`, `src/features/communities/components/CommunityFeed.tsx`, `src/features/feed/components/post-detail/PostDetailHeader.tsx`
- Trigger: User opens post overflow/header actions and selects pin where the callback is wired.
- Workaround: Not detected in code. Treat pin UI as incomplete until `src/features/feed/services/postPin.service.ts` or equivalent mutation is connected.

**API request failure can look like empty data in community membership/composer paths:**
- Symptoms: Community membership, join requests, or composer community lists can resolve to empty states after request failures.
- Files: `src/features/communities/services/community.service.ts`, `src/features/feed/components/PostComposerForm.tsx`
- Trigger: Backend unavailable, 401/403/500 during `fetchMyCommunityIdSet`, `fetchMyCommunitiesForComposer`, `fetchMyCommunityMembership`, or `fetchCommunityJoinRequestRows`.
- Workaround: Some UI offers retry for composer community loading; other call sites do not preserve the underlying error.

**Other confirmed user-facing bugs:**
- Symptoms: Not found during static mapping.
- Files: Not detected.
- Trigger: Not detected.
- Workaround: Not applicable.

## Security Considerations

**High - Bearer token storage is XSS-sensitive:**
- Risk: Any script execution in the origin can read `AUTH_TOKEN_KEY` and attach it to API calls.
- Files: `src/lib/api.ts`, `src/features/auth/services/auth.service.ts`, `src/features/auth/constants.ts`
- Current mitigation: Token is only read through helper functions and attached by an Axios request interceptor in `src/lib/api.ts`.
- Recommendations: Prefer HTTP-only secure cookies or short-lived access tokens with refresh handled outside JavaScript-readable storage.

**High - Onboarding can persist sensitive registration fields in sessionStorage:**
- Risk: CPF/password or other account fields can remain in browser session storage through the multi-step registration flow.
- Files: `src/features/auth/onboarding/types.ts`, `src/features/auth/onboarding/onboarding.storage.ts`, `src/features/auth/onboarding/OnboardingContext.tsx`
- Current mitigation: A code comment warns not to persist password/CPF in production.
- Recommendations: Move sensitive onboarding state to the server after step 1 and clear client state aggressively on route exit, logout, and registration failure.

**Medium - Image URLs and data URLs are accepted directly into post payloads:**
- Risk: Users can submit public image URLs or base64 data URLs. This can increase payload size, leak client-side image metadata, or rely on remote third-party image hosts.
- Files: `src/features/feed/components/PostComposerForm.tsx`, `src/features/feed/services/post.service.ts`, `src/lib/readImageAsDataUrlIfSmall.ts`
- Current mitigation: Local file data URLs are limited to 450 KB in `src/lib/readImageAsDataUrlIfSmall.ts`; file input checks `image/*`.
- Recommendations: Replace data URL transport with backend upload/storage, validate remote image URLs server-side, and enforce content-type/size limits on the backend.

**Medium - Environment files exist and must remain secret-safe:**
- Risk: `.env.development` is present in the repo workspace. Environment files can accidentally contain deployment URLs or credentials.
- Files: `.env.development`, `.env.example`, `src/lib/api.ts`
- Current mitigation: `.env.example` documents `VITE_API_BASE_URL`; values were not included in this report.
- Recommendations: Keep real secrets out of Vite variables because `VITE_*` is exposed to the client bundle. Ensure `.env.development` does not contain credentials and is ignored when appropriate.

## Performance Bottlenecks

**Medium - Composer community loading makes N+1 requests:**
- Problem: `fetchMyCommunitiesForComposer` first fetches the user's community IDs, then requests each community individually with `Promise.all`.
- Files: `src/features/communities/services/community.service.ts`, `src/features/feed/components/PostComposerForm.tsx`
- Cause: No single backend endpoint returns the full community rows needed by the composer.
- Improvement path: Add or use a `/users/me/communities` response that includes display data, or add a batch communities endpoint.

**Medium - Comment and post detail flows reload whole resources after mutations:**
- Problem: Like toggles fetch the post before and after toggling; comment detail loads post and full comment list and then appends created comments locally.
- Files: `src/domain/services/postMock.service.ts`, `src/features/feed/hooks/usePostDetail.ts`, `src/features/feed/hooks/useFeed.ts`
- Cause: The service returns final state by re-reading instead of using mutation responses consistently.
- Improvement path: Have like/comment mutations return canonical counts/state from the backend and update local state from the mutation response.

**Low - Base64 image transport increases request size:**
- Problem: Local images are converted to data URLs and sent in JSON payloads.
- Files: `src/lib/readImageAsDataUrlIfSmall.ts`, `src/features/feed/components/PostComposerForm.tsx`, `src/features/feed/services/post.service.ts`
- Cause: Direct upload/storage is not implemented.
- Improvement path: Use multipart upload or pre-signed upload URLs and store only final asset URLs in post payloads.

## Fragile Areas

**Authentication/session boundary:**
- Files: `src/lib/api.ts`, `src/features/auth/services/auth.service.ts`, `src/features/auth/context/AuthContext.tsx`, `src/app/ProtectedRoute.tsx`
- Why fragile: `isLoading` is hardcoded to false, auth state is initialized synchronously from storage, and route protection relies on client-readable user state.
- Safe modification: Change auth storage and route behavior together. Verify login, logout, token expiration, direct navigation to protected routes, and API 401 handling.
- Test coverage: No test files detected.

**Direct messages realtime synchronization:**
- Files: `src/features/messages/pages/ConversationsPage.tsx`, `src/features/messages/hooks/useDirectMessagesSignalR.ts`, `src/features/messages/services/messages.service.ts`
- Why fragile: REST pagination, selected route state, SignalR group membership, debounced inbox reloads, and reconnection behavior are coordinated manually.
- Safe modification: Keep handlers idempotent, test reconnect/open conversation changes, and avoid adding state updates that depend on stale `selectedId`.
- Test coverage: No test files detected.

**Community premium/admin flows:**
- Files: `src/features/communities/pages/CommunityAdminDashboardPage.tsx`, `src/features/communities/services/community.service.ts`, `src/features/communities/components/CommunityPostBoostDialog.tsx`, `src/features/communities/components/CommunityPremiumSidebarCard.tsx`
- Why fragile: Access depends on membership, premium capabilities, analytics, boosts, and checkout redirects across multiple endpoints.
- Safe modification: Add explicit loading/error states and cover 403, inactive premium, missing membership, and checkout failures before changing UI.
- Test coverage: No test files detected.

**Feed/post interaction state:**
- Files: `src/features/feed/hooks/useFeed.ts`, `src/features/feed/hooks/usePostDetail.ts`, `src/domain/services/postMock.service.ts`, `src/domain/mocks/postInteractionMockStore.ts`
- Why fragile: Optimistic likes, local post list refresh, detail comment state, and legacy mock subscriptions coexist.
- Safe modification: Treat server response as canonical, add rollback tests for failed mutations, and remove mock subscriptions only after confirming every feature has API-backed invalidation.
- Test coverage: No test files detected.

## Scaling Limits

**Frontend test coverage:**
- Current capacity: 0 test files detected by `**/*.{test,spec}.{ts,tsx,js,jsx}`; `package.json` has no `test` script.
- Limit: Regressions in auth, feed, communities, subscriptions, search, and direct messages rely on manual testing.
- Scaling path: Add Vitest and React Testing Library for unit/component tests, plus Playwright or Cypress for registration/login/feed/messaging smoke flows.

**Community member pagination aggregation:**
- Current capacity: `fetchAllCommunityMembers` loops pages of 50 until `hasNextPage` is false.
- Limit: Large communities can trigger multiple sequential requests and slow admin/member views.
- Scaling path: Prefer paginated UI for member management or a backend endpoint optimized for member search/roles.

**Client bundle/data payloads for static assets and seed data:**
- Current capacity: `src/domain/mocks/seed-data.ts` is the largest source file, and SVG assets include embedded base64 images.
- Limit: Legacy seed/static payloads can inflate bundle size if imported into production routes.
- Scaling path: Audit imports from `src/domain/mocks/seed-data.ts`, move mock seed data behind dev-only boundaries, and optimize embedded SVG/image assets.

## Dependencies at Risk

**Test tooling missing:**
- Risk: No test runner dependency or script is present.
- Impact: Changes cannot be verified automatically beyond `npm run build` and `npm run lint`.
- Migration plan: Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and focused tests for auth storage, API mappers, feed hooks, and messaging state.

**React 19 / React Router 7 / Vite 7 stack:**
- Risk: The stack is current and fast-moving; UI libraries and router behavior may require careful upgrade verification.
- Impact: Minor dependency updates can affect rendering, routing, or dev/build behavior.
- Migration plan: Pin lockfile updates through CI with build/lint/test, and add smoke tests around `src/app/router.tsx`.

**SignalR browser transport behavior:**
- Risk: Direct messages rely on `@microsoft/signalr` token transport and automatic reconnect settings.
- Impact: Reverse proxy, CORS, websocket fallback, or token expiry changes can silently stop realtime updates.
- Migration plan: Add reconnect/error UI and integration tests against a deployed backend or mocked SignalR server.

## Missing Critical Features

**Automated tests:**
- Problem: No test files, no test script, and no test config were detected.
- Blocks: Safe refactoring of auth, onboarding, feed mutation, community admin, and direct messages.

**Error boundary and global API failure handling:**
- Problem: `src/App.tsx` only renders `RouterProvider`; no app-level error boundary or global 401/session-expired flow was detected.
- Blocks: Consistent UX for render crashes, expired tokens, and unrecoverable route errors.

**Documentation beyond README:**
- Problem: `docs/**/*.md` was not detected; codebase behavior is mainly documented inline.
- Blocks: Onboarding new contributors into API contracts, environment setup, auth/security posture, and manual QA flows.

**Production-safe onboarding storage:**
- Problem: The code explicitly notes that sensitive onboarding fields should not remain in `sessionStorage` for production.
- Blocks: Shipping registration flows that collect sensitive data without a backend-backed temporary session.

## Test Coverage Gaps

**Auth and protected routing:**
- What's not tested: Login/register/logout, token persistence, `ProtectedRoute`, session patching, and 401/403 error UX.
- Files: `src/features/auth/services/auth.service.ts`, `src/features/auth/context/AuthContext.tsx`, `src/app/ProtectedRoute.tsx`, `src/lib/api.ts`
- Risk: Users can be incorrectly treated as logged in/out, tokens can persist unexpectedly, or protected routes can fail during auth changes.
- Priority: High

**Onboarding sensitive-data flow:**
- What's not tested: Draft persistence, clearing behavior, registration completion, and email verification steps.
- Files: `src/features/auth/onboarding/OnboardingContext.tsx`, `src/features/auth/onboarding/onboarding.storage.ts`, `src/features/auth/onboarding/types.ts`
- Risk: Sensitive data can remain in storage, steps can become inconsistent, or users can lose progress.
- Priority: High

**Feed and post mutations:**
- What's not tested: Feed pagination/filtering, optimistic like rollback, create post with profile/community target, image/data URL limits, comments/replies, edit/delete/report.
- Files: `src/features/feed/hooks/useFeed.ts`, `src/features/feed/hooks/usePostDetail.ts`, `src/features/feed/components/PostComposerForm.tsx`, `src/domain/services/postMock.service.ts`, `src/domain/services/contentModerationMock.service.ts`
- Risk: UI counters and lists can diverge from server state or silently lose mutation failures.
- Priority: High

**Communities and premium/admin flows:**
- What's not tested: Community CRUD validation, membership states, join requests, premium analytics access, boost actions, and billing checkout redirects.
- Files: `src/features/communities/services/community.service.ts`, `src/features/communities/pages/CommunityAdminDashboardPage.tsx`, `src/features/subscription/services/billingCheckout.service.ts`
- Risk: Staff-only controls, premium gates, and billing actions can regress without detection.
- Priority: High

**Direct messages realtime:**
- What's not tested: Conversation list reloads, request accept/reject, message send/edit/delete, route-driven selection, SignalR reconnect, and group join/leave.
- Files: `src/features/messages/pages/ConversationsPage.tsx`, `src/features/messages/hooks/useDirectMessagesSignalR.ts`, `src/features/messages/services/messages.service.ts`
- Risk: Messaging can show stale messages, duplicate messages, or lose updates after reconnect.
- Priority: High

**Search and API mappers:**
- What's not tested: Response-shape drift, fallback defaults, invalid enum/category handling, and empty query behavior.
- Files: `src/features/search/services/search.service.ts`, `src/lib/apiMappers.ts`
- Risk: Backend DTO changes can silently render empty or malformed data.
- Priority: Medium

---

*Concerns audit: Monday Apr 27, 2026*
