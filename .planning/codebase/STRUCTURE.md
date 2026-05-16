# Codebase Structure

**Analysis Date:** Monday Apr 27, 2026

## Directory Layout

```text
woody-frontend/
├── index.html                  # Browser entry; loads `/src/main.tsx`
├── package.json                # Vite/React scripts and dependencies
├── vite.config.ts              # Vite React plugin and `@` alias
├── tsconfig*.json              # TypeScript project configs
├── eslint.config.js            # ESLint config
├── postcss.config.js           # PostCSS/Tailwind config
├── .env.example                # Environment template; contents not read
├── .env.development            # Local environment file; contents not read
├── public/                     # Static public assets, if present
├── src/
│   ├── main.tsx                # React root bootstrap
│   ├── App.tsx                 # RouterProvider wrapper
│   ├── index.css               # Tailwind imports, shadcn CSS, global Woody tokens
│   ├── app/                    # App-level routing and route guards
│   ├── assets/                 # SVG logos/cat assets
│   ├── components/ui/          # Shared UI primitives
│   ├── domain/                 # Shared domain types, permissions, mock stores/services
│   ├── features/               # Product feature modules
│   └── lib/                    # Cross-feature utilities, API client, mappers, UI class recipes
└── .planning/codebase/         # GSD codebase mapping documents
```

## Directory Purposes

**Project Root:**
- Purpose: Build, lint, TypeScript, and Vite configuration.
- Contains: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `eslint.config.js`, `postcss.config.js`, `index.html`.
- Key files: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.app.json`.

**`src/app`:**
- Purpose: App-level route composition and access control.
- Contains: Router and route guard files.
- Key files: `src/app/router.tsx`, `src/app/ProtectedRoute.tsx`, `src/app/RootRedirect.tsx`.

**`src/features`:**
- Purpose: Feature-sliced product code.
- Contains: Auth, feed, communities, profile, messages, landing, search, subscription, and users modules.
- Key files: `src/features/feed/index.ts`, `src/features/auth/context/AuthContext.tsx`, `src/features/messages/pages/ConversationsPage.tsx`, `src/features/communities/services/community.service.ts`.

**`src/features/auth`:**
- Purpose: Login, registration, onboarding, session context, auth constants, auth services, and auth-specific hooks/pages.
- Contains: `components`, `context`, `hooks`, `onboarding`, `pages`, `services`, `types.ts`, `constants.ts`, `index.ts`.
- Key files: `src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/auth.service.ts`, `src/features/auth/onboarding/OnboardingContext.tsx`, `src/features/auth/onboarding/onboarding.storage.ts`.

**`src/features/feed`:**
- Purpose: Main authenticated shell, feed pages, post detail/create flows, feed hooks, composer context, and post/feed services.
- Contains: `components`, `context`, `hooks`, `pages`, `services`, `types.ts`, `index.ts`.
- Key files: `src/features/feed/components/FeedLayout.tsx`, `src/features/feed/hooks/useFeed.ts`, `src/features/feed/services/feed.service.ts`, `src/features/feed/services/post.service.ts`, `src/features/feed/context/CreatePostComposerContext.tsx`.

**`src/features/communities`:**
- Purpose: Community listing, creation, detail, admin dashboard, member management, community settings, and community API services.
- Contains: `components`, `pages`, `services`, `types.ts`, `index.ts`.
- Key files: `src/features/communities/pages/CommunityDetailPage.tsx`, `src/features/communities/pages/CommunityAdminDashboardPage.tsx`, `src/features/communities/services/community.service.ts`, `src/features/communities/services/communityMembership.service.ts`.

**`src/features/profile`:**
- Purpose: Profile pages, profile editing, follow UI/lists, profile sections, and profile API access.
- Contains: `components`, `hooks`, `pages`, `services`, `types.ts`, `index.ts`.
- Key files: `src/features/profile/pages/ProfilePage.tsx`, `src/features/profile/services/profile.service.ts`, `src/features/profile/services/follow.service.ts`, `src/features/profile/hooks/useUserProfile.ts`.

**`src/features/messages`:**
- Purpose: Direct message inbox, conversation route/page, chat components, SignalR lifecycle, REST message services, and DM helper libs.
- Contains: `components`, `hooks`, `lib`, `pages`, `services`, `types.ts`, `index.ts`.
- Key files: `src/features/messages/pages/ConversationsPage.tsx`, `src/features/messages/hooks/useDirectMessagesSignalR.ts`, `src/features/messages/services/messages.service.ts`.

**`src/features/search`:**
- Purpose: Shared search modal/panel and search API service.
- Contains: Search components and service.
- Key files: `src/features/search/components/SearchModal.tsx`, `src/features/search/components/SharedSearchPanel.tsx`, `src/features/search/services/search.service.ts`.

**`src/features/subscription`:**
- Purpose: User/community subscription UI, plan pages, checkout/portal services, subscription gating helpers, and Pro badge/paywall components.
- Contains: `components`, `hooks`, `pages`, `services`, `types.ts`, `constants.ts`, `subscriptionCapabilities.ts`, `useSubscriptionCapabilities.ts`.
- Key files: `src/features/subscription/pages/PlanosPage.tsx`, `src/features/subscription/services/billingCheckout.service.ts`, `src/features/subscription/services/billingPortal.service.ts`, `src/features/subscription/useSubscriptionCapabilities.ts`.

**`src/features/landing`:**
- Purpose: Public marketing/landing page and landing sections.
- Contains: `pages`, `components`, `constants.ts`, `index.ts`.
- Key files: `src/features/landing/pages/LandingPage.tsx`, `src/features/landing/components/LandingHero.tsx`.

**`src/features/users`:**
- Purpose: User/social graph service code that does not belong to profile UI directly.
- Contains: User social service.
- Key files: `src/features/users/services/userSocial.service.ts`.

**`src/components/ui`:**
- Purpose: Reusable UI primitives shared across features.
- Contains: Button, card, dialog, dropdown menu, input, textarea, avatar, skeleton.
- Key files: `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/card.tsx`.

**`src/domain`:**
- Purpose: Shared product/domain contracts and transitional mock stores/services.
- Contains: Shared types, selectors, permissions, category labels, billing gates, content moderation helpers, mock seeds/stores/services.
- Key files: `src/domain/types.ts`, `src/domain/permissions.ts`, `src/domain/communityBillingGates.ts`, `src/domain/mocks/postInteractionMockStore.ts`, `src/domain/services/postMock.service.ts`.

**`src/lib`:**
- Purpose: Cross-feature infrastructure and utilities.
- Contains: Axios API client, DTO mappers, date formatting, image helper, social graph event helpers, Woody class recipes, `cn` utility.
- Key files: `src/lib/api.ts`, `src/lib/apiMappers.ts`, `src/lib/woody-ui.ts`, `src/lib/utils.ts`, `src/lib/socialGraphEvents.ts`.

**`src/assets`:**
- Purpose: Versioned app assets imported by React components/CSS.
- Contains: SVG logos and cat assets.
- Key files: `src/assets/logo.svg`, `src/assets/logo-black.svg`, `src/assets/cat.svg`, `src/assets/cat-white.svg`.

**`.planning/codebase`:**
- Purpose: GSD codebase intelligence documents.
- Contains: Current mapping outputs.
- Key files: `.planning/codebase/STACK.md`, `.planning/codebase/INTEGRATIONS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

## Key File Locations

**Entry Points:**
- `index.html`: Browser entry and Vite script root.
- `src/main.tsx`: React `createRoot` bootstrap.
- `src/App.tsx`: App component that renders `RouterProvider`.
- `src/app/router.tsx`: Central route table for public, onboarding, protected, and fallback routes.

**Routing:**
- `src/app/router.tsx`: Add new top-level routes here.
- `src/app/ProtectedRoute.tsx`: Use this wrapper for routes that require authentication.
- `src/features/*/index.ts`: Export page components for cleaner router imports.

**Configuration:**
- `package.json`: Scripts (`dev`, `build`, `lint`, `preview`) and dependencies.
- `vite.config.ts`: Vite React plugin and `@` alias.
- `tsconfig.app.json`: Strict app TypeScript options and `@/* -> src/*` path alias.
- `eslint.config.js`: ESLint rules.
- `postcss.config.js`: PostCSS/Tailwind configuration.
- `.env.example`: Environment example present; contents not read.
- `.env.development`: Development environment file present; contents not read.

**Core Logic:**
- `src/lib/api.ts`: API base URL resolution, Axios instance, auth token storage helpers, error extraction, SignalR hub URL.
- `src/lib/apiMappers.ts`: Backend-to-frontend mapping for users, posts, comments, communities, profiles.
- `src/domain/types.ts`: Shared domain model.
- `src/features/auth/context/AuthContext.tsx`: Session provider/hook.
- `src/features/feed/components/FeedLayout.tsx`: Authenticated app shell.
- `src/features/feed/hooks/useFeed.ts`: Feed state and lifecycle.
- `src/features/messages/hooks/useDirectMessagesSignalR.ts`: Realtime direct-message lifecycle.

**Feature Pages:**
- `src/features/auth/pages/AuthEntryPage.tsx`: Auth entry page.
- `src/features/auth/pages/LoginPage.tsx`: Login page.
- `src/features/auth/pages/IntroPage.tsx`: Root intro page.
- `src/features/auth/onboarding/OnboardingFlow.tsx`: Onboarding route shell.
- `src/features/feed/pages/FeedPage.tsx`: Main feed.
- `src/features/feed/pages/CreatePostPage.tsx`: Dedicated create post page.
- `src/features/feed/pages/PostDetailPage.tsx`: Post detail/comments page.
- `src/features/profile/pages/ProfilePage.tsx`: User profile page.
- `src/features/communities/pages/CommunitiesPage.tsx`: Community listing.
- `src/features/communities/pages/CreateCommunityPage.tsx`: Community creation page.
- `src/features/communities/pages/CommunityDetailPage.tsx`: Community detail/feed page.
- `src/features/communities/pages/CommunityAdminDashboardPage.tsx`: Community analytics/admin dashboard.
- `src/features/messages/pages/ConversationsPage.tsx`: Conversations inbox/thread page.
- `src/features/subscription/pages/PlanosPage.tsx`: Subscription plan page.
- `src/features/landing/pages/LandingPage.tsx`: Public landing page.

**Services:**
- `src/features/auth/services/auth.service.ts`: Login/register/logout/session subscription state.
- `src/features/feed/services/feed.service.ts`: Feed API.
- `src/features/feed/services/post.service.ts`: Post create API.
- `src/domain/services/postMock.service.ts`: Post/comment API wrappers with legacy mock names.
- `src/features/communities/services/community.service.ts`: Community API and community premium helpers.
- `src/features/communities/services/communityMembership.service.ts`: Community membership operations.
- `src/features/profile/services/profile.service.ts`: Profile read/update/profile posts.
- `src/features/profile/services/follow.service.ts`: Follow graph operations.
- `src/features/messages/services/messages.service.ts`: Conversation/message REST operations.
- `src/features/search/services/search.service.ts`: Search API.
- `src/features/subscription/services/billingCheckout.service.ts`: Checkout session creation.
- `src/features/subscription/services/billingPortal.service.ts`: Billing portal session creation.
- `src/features/users/services/userSocial.service.ts`: Social user service.

**Testing:**
- Test files and test runner config were not found during this architecture/structure pass.
- No `jest.config.*` or `vitest.config.*` file was detected in the explored frontend root.

## Naming Conventions

**Files:**
- React components and pages use PascalCase: `src/features/feed/components/PostCard.tsx`, `src/features/profile/pages/ProfilePage.tsx`.
- Hooks use `use*.ts` or `use*.tsx`: `src/features/feed/hooks/useFeed.ts`, `src/features/messages/hooks/useDirectMessagesSignalR.ts`.
- Feature services use `*.service.ts`: `src/features/communities/services/community.service.ts`.
- Context providers use `*Context.tsx`: `src/features/auth/context/AuthContext.tsx`.
- Feature barrels use `index.ts`: `src/features/feed/index.ts`.
- Shared utility files use camelCase or descriptive lower camel names: `src/lib/apiMappers.ts`, `src/lib/formatIsoDate.ts`, `src/lib/readImageAsDataUrlIfSmall.ts`.

**Directories:**
- Feature modules live under `src/features/<feature>`.
- Feature internals use purpose folders: `pages`, `components`, `hooks`, `services`, `context`, `lib`, `onboarding`.
- Shared UI primitives live under `src/components/ui`.
- Domain support code lives under `src/domain`, with mock stores under `src/domain/mocks` and domain services under `src/domain/services`.
- Cross-feature utilities live under `src/lib`.

## Where to Add New Code

**New Route/Page:**
- Add the page under `src/features/<feature>/pages/<PageName>.tsx`.
- Export it from `src/features/<feature>/index.ts` if it should be imported by the router.
- Register the route in `src/app/router.tsx`.
- Wrap with `ProtectedRoute` in `src/app/router.tsx` when authentication is required.

**New Feature Module:**
- Create `src/features/<feature>/`.
- Put page-level route targets in `src/features/<feature>/pages`.
- Put reusable feature UI in `src/features/<feature>/components`.
- Put API calls in `src/features/<feature>/services/<feature>.service.ts`.
- Put feature-only hooks in `src/features/<feature>/hooks`.
- Put feature-only types in `src/features/<feature>/types.ts`.
- Add `src/features/<feature>/index.ts` when multiple files need public exports.

**New API Call:**
- Use `api` from `src/lib/api.ts`.
- Map backend responses in `src/lib/apiMappers.ts` when the mapped type is shared across features.
- Keep feature-specific response shaping in `src/features/<feature>/services/*.ts`.
- Convert Axios/backend failures through `getApiErrorMessage` from `src/lib/api.ts`.

**New Shared Domain Model:**
- Add cross-feature product types to `src/domain/types.ts`.
- Add permissions/gates/selectors under `src/domain` when they are shared by multiple features.
- Keep UI-specific view models inside `src/features/<feature>/types.ts`.

**New Shared UI Primitive:**
- Add low-level reusable primitives to `src/components/ui`.
- Add Woody-specific class recipes to `src/lib/woody-ui.ts`.
- Use `cn` from `src/lib/utils.ts` for class merging.

**New Auth-Aware UI:**
- Read session through `useAuth` from `src/features/auth/context/AuthContext.tsx`.
- Read subscription capabilities through `useSubscriptionCapabilities` from `src/features/subscription/useSubscriptionCapabilities.ts`.
- Do not read `localStorage` directly from components; use existing auth/API helpers.

**New Direct Message Realtime Behavior:**
- Extend event handling in `src/features/messages/hooks/useDirectMessagesSignalR.ts` if it is transport-level.
- Extend `src/features/messages/pages/ConversationsPage.tsx` if it is page orchestration or state merging.
- Extend `src/features/messages/services/messages.service.ts` for REST endpoints.

**New Layout/Navigation Behavior:**
- Add authenticated shell changes in `src/features/feed/components/FeedLayout.tsx`.
- Add desktop nav changes in `src/features/feed/components/Sidebar.tsx`.
- Add mobile nav changes in `src/features/feed/components/MobileBottomNav.tsx`.
- Add right-column suggestions/following changes in `src/features/feed/components/RightPanel.tsx`.

**Utilities:**
- General cross-feature helpers: `src/lib`.
- Domain-specific helpers used by more than one feature: `src/domain`.
- Feature-only helpers: `src/features/<feature>/lib` or colocated near the consuming feature.

## Route Map

| Route | Page/Behavior | Auth | File |
|-------|---------------|------|------|
| `/` | Intro page | Public | `src/features/auth/pages/IntroPage.tsx` |
| `/landing` | Landing page | Public | `src/features/landing/pages/LandingPage.tsx` |
| `/auth` | Auth entry | Public | `src/features/auth/pages/AuthEntryPage.tsx` |
| `/auth/login` | Login | Public | `src/features/auth/pages/LoginPage.tsx` |
| `/auth/register` | Redirects to `/auth/onboarding/1` | Public | `src/app/router.tsx` |
| `/auth/onboarding` | Redirects to step 1 | Public | `src/app/router.tsx` |
| `/auth/onboarding/1` | Account step | Public, onboarding provider | `src/features/auth/onboarding/steps/OnboardingStepAccount.tsx` |
| `/auth/onboarding/2` | Email verification step | Public, onboarding provider | `src/features/auth/onboarding/steps/OnboardingStepVerifyEmail.tsx` |
| `/auth/onboarding/3` | Profile photo step | Public, onboarding provider | `src/features/auth/onboarding/steps/OnboardingStepProfilePhoto.tsx` |
| `/auth/onboarding/4` | Interests step | Public, onboarding provider | `src/features/auth/onboarding/steps/OnboardingStepInterests.tsx` |
| `/auth/onboarding/5` | Communities step | Public, onboarding provider | `src/features/auth/onboarding/steps/OnboardingStepCommunities.tsx` |
| `/auth/onboarding/6` | Completion step | Public, onboarding provider | `src/features/auth/onboarding/steps/OnboardingStepComplete.tsx` |
| `/feed` | Main feed | Protected | `src/features/feed/pages/FeedPage.tsx` |
| `/messages` | Conversations inbox | Protected | `src/features/messages/pages/ConversationsPage.tsx` |
| `/messages/:conversationId` | Conversation thread | Protected | `src/features/messages/pages/ConversationsPage.tsx` |
| `/criar` | Create post page | Protected | `src/features/feed/pages/CreatePostPage.tsx` |
| `/posts/:postId` | Post detail | Protected | `src/features/feed/pages/PostDetailPage.tsx` |
| `/home` | Redirects to `/feed` | Protected redirect | `src/app/router.tsx` |
| `/profile/:userId` | Profile page | Protected | `src/features/profile/pages/ProfilePage.tsx` |
| `/communities/nova` | Create community | Protected | `src/features/communities/pages/CreateCommunityPage.tsx` |
| `/communities` | Communities listing | Protected | `src/features/communities/pages/CommunitiesPage.tsx` |
| `/communities/:communitySlug/admin` | Community admin dashboard | Protected | `src/features/communities/pages/CommunityAdminDashboardPage.tsx` |
| `/communities/:communitySlug` | Community detail | Protected | `src/features/communities/pages/CommunityDetailPage.tsx` |
| `/assinatura/sucesso` | Subscription success | Protected | `src/features/subscription/pages` |
| `/assinatura/cancelado` | Subscription canceled | Protected | `src/features/subscription/pages` |
| `/planos` | Plans page | Protected | `src/features/subscription/pages/PlanosPage.tsx` |
| `*` | Redirects to `/` | Public fallback | `src/app/router.tsx` |

## Special Directories

**`.cursor/agents`:**
- Purpose: Cursor/GSD agent definitions.
- Generated: Yes.
- Committed: Present as untracked files in current git status snapshot.
- Mapping note: Ignored per instruction; not used for product architecture.

**`.cursor/get-shit-done`:**
- Purpose: GSD workflow implementation/templates/references.
- Generated: Yes.
- Committed: Present as untracked files in current git status snapshot.
- Mapping note: Ignored per instruction; not used for product architecture.

**`.cursor/skills`:**
- Purpose: GSD workflow skills available to Cursor.
- Generated: Yes.
- Committed: Present in workspace.
- Mapping note: Contains GSD workflow skills; no frontend app-specific architecture rules were detected from the relevant mapper skill.

**`node_modules`:**
- Purpose: Installed npm dependencies.
- Generated: Yes.
- Committed: No.
- Mapping note: Ignored per instruction.

**`.planning`:**
- Purpose: GSD planning and codebase intelligence artifacts.
- Generated: Yes.
- Committed: Project-dependent.
- Mapping note: `.planning/codebase/STACK.md` and `.planning/codebase/INTEGRATIONS.md` existed before this pass; this pass writes `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/STRUCTURE.md`.

**Environment Files:**
- Purpose: Vite/runtime environment configuration.
- Generated: No.
- Committed: `.env.example` may be template; `.env.development` is local environment config.
- Mapping note: `.env.example` and `.env.development` exist but contents were not read.

---

*Structure analysis: Monday Apr 27, 2026*
