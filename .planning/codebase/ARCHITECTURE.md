# Architecture

**Analysis Date:** Monday Apr 27, 2026

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Vite + React SPA                         │
│   `index.html` -> `src/main.tsx` -> `src/App.tsx`            │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Router Data Router                   │
│                  `src/app/router.tsx`                       │
├──────────────────┬──────────────────┬───────────────────────┤
│ Public auth flow │ Protected app    │ Landing/marketing     │
│ `features/auth`  │ `features/*`     │ `features/landing`    │
└────────┬─────────┴────────┬─────────┴───────────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cross-cutting providers                     │
│ `AuthProvider`, `OnboardingProvider`, `FeedLayout` composer  │
│ `src/features/auth/context/AuthContext.tsx`                  │
│ `src/features/auth/onboarding/OnboardingContext.tsx`         │
│ `src/features/feed/context/CreatePostComposerContext.tsx`    │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│             Feature pages, hooks, components, services       │
│ `src/features/feed`, `src/features/communities`,             │
│ `src/features/profile`, `src/features/messages`,             │
│ `src/features/search`, `src/features/subscription`           │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                  API and local browser state                 │
│ `src/lib/api.ts`, `src/lib/apiMappers.ts`,                   │
│ `localStorage`, `sessionStorage`, SignalR direct messages    │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| DOM bootstrap | Mounts React under `#root` with `StrictMode` and global CSS | `src/main.tsx` |
| App shell | Provides `RouterProvider` using the central router | `src/App.tsx` |
| Router | Declares public, onboarding, protected, subscription, feed, profile, community, and message routes | `src/app/router.tsx` |
| Route guard | Blocks protected pages while unauthenticated and redirects to `/auth` | `src/app/ProtectedRoute.tsx` |
| Auth state | Stores authenticated user in React context and persists user/token in `localStorage` | `src/features/auth/context/AuthContext.tsx`, `src/features/auth/services/auth.service.ts` |
| Onboarding state | Persists multi-step registration draft in `sessionStorage` | `src/features/auth/onboarding/OnboardingContext.tsx`, `src/features/auth/onboarding/onboarding.storage.ts` |
| Feed layout | Owns global app chrome, desktop/sidebar layout, mobile nav, search modal, and create-post modal provider | `src/features/feed/components/FeedLayout.tsx` |
| API client | Normalizes API base URL, adds bearer token, exposes REST helpers and SignalR hub URL | `src/lib/api.ts` |
| API mappers | Converts backend DTO-like records into frontend domain objects | `src/lib/apiMappers.ts` |
| Domain types | Defines shared post, community, user, membership, moderation, and billing types | `src/domain/types.ts` |
| Feed data hook | Loads paginated feed, tracks filter/page/loading/error state, and applies optimistic likes | `src/features/feed/hooks/useFeed.ts` |
| Direct messages realtime | Manages SignalR connection, inbox group, conversation group, and reconnect lifecycle | `src/features/messages/hooks/useDirectMessagesSignalR.ts` |
| Conversations page | Orchestrates DM REST reads/mutations, route selection, SignalR events, and message/list state | `src/features/messages/pages/ConversationsPage.tsx` |

## Pattern Overview

**Overall:** Feature-sliced React SPA with central routing, colocated feature services/hooks/components, and a thin shared API/mapping layer.

**Key Characteristics:**
- Routes are centralized in `src/app/router.tsx`; feature modules expose page entry points through `src/features/*/index.ts`.
- Feature pages own their own server-state lifecycle using `useState`, `useEffect`, `useMemo`, `useCallback`, and feature hooks rather than a global server-state library.
- Shared session state is intentionally narrow: `AuthProvider` wraps every route; `OnboardingProvider` wraps only onboarding; `CreatePostComposerProvider` wraps `FeedLayout`.
- API access flows through `src/lib/api.ts`; feature services should import `api` and map responses through `src/lib/apiMappers.ts` or local DTO types.
- Domain contracts live in `src/domain/types.ts`; feature-specific UI/API shapes live in `src/features/*/types.ts`.

## Layers

**Bootstrap Layer:**
- Purpose: Start the SPA and load global CSS.
- Location: `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Contains: DOM root, font preconnects, Vite entry script, React root, global Tailwind/theme variables.
- Depends on: React, React DOM, router.
- Used by: Browser runtime.

**Routing Layer:**
- Purpose: Map URLs to feature pages and apply route-scoped providers/guards.
- Location: `src/app/router.tsx`, `src/app/ProtectedRoute.tsx`
- Contains: `createBrowserRouter`, route redirects, protected route wrappers, onboarding nested routes.
- Depends on: `react-router-dom`, `AuthProvider`, feature page exports.
- Used by: `src/App.tsx`.

**Feature Layer:**
- Purpose: Own user-facing workflows by domain area.
- Location: `src/features/*`
- Contains: `pages`, `components`, `hooks`, `services`, `context`, `types`, and feature barrels.
- Depends on: `src/lib`, `src/domain`, `src/components/ui`, `react-router-dom`.
- Used by: Router and cross-feature UI composition.

**Shared UI Layer:**
- Purpose: Provide reusable primitives and design utilities.
- Location: `src/components/ui`, `src/lib/woody-ui.ts`, `src/lib/utils.ts`, `src/index.css`
- Contains: shadcn/Radix-style primitives (`button`, `card`, `dialog`, `dropdown-menu`, etc.), `cn`, Woody layout/theme class helpers.
- Depends on: React, Tailwind CSS, class utilities.
- Used by: All feature components.

**Domain Layer:**
- Purpose: Centralize shared product concepts and remaining local mock stores.
- Location: `src/domain`
- Contains: Shared types, permissions/gates, selectors, mock seed data, local mutable mock stores, mock domain services.
- Depends on: Local types and small helpers.
- Used by: Feature services, hooks, and UI components.

**API Integration Layer:**
- Purpose: Normalize HTTP, auth token propagation, API errors, DTO mapping, and realtime hub URL construction.
- Location: `src/lib/api.ts`, `src/lib/apiMappers.ts`, `src/features/*/services/*.ts`, `src/features/messages/hooks/useDirectMessagesSignalR.ts`
- Contains: Axios instance, request interceptor, REST service functions, SignalR hook, DTO mappers.
- Depends on: Axios, `@microsoft/signalr`, browser storage, feature/domain types.
- Used by: Feature hooks and pages.

## Data Flow

### Primary App Load and Route Path

1. Browser loads `index.html`, which provides `<div id="root">` and imports `/src/main.tsx` (`index.html`).
2. `src/main.tsx` renders `<App />` inside React `StrictMode`.
3. `src/App.tsx` renders `RouterProvider` with `router`.
4. `src/app/router.tsx` wraps all routes in `AuthProvider` and renders the matched route via `Outlet`.
5. Protected routes render `ProtectedRoute`; unauthenticated sessions redirect to `/auth` (`src/app/ProtectedRoute.tsx`).
6. Feature pages render layout and fetch data through feature hooks/services.

### Authentication Flow

1. Public routes `/auth`, `/auth/login`, and `/auth/onboarding/*` are declared in `src/app/router.tsx`.
2. Login/register call `loginMock` or `registerMock` in `src/features/auth/services/auth.service.ts`.
3. Auth service posts to `/Auth/login` or `/Auth/register`, stores `token` under `AUTH_TOKEN_KEY`, stores the mapped user under `AUTH_STORAGE_KEY`, and updates the user display patch store.
4. `AuthProvider` in `src/features/auth/context/AuthContext.tsx` reads the stored user on initialization and exposes `user`, `isAuthenticated`, `login`, `register`, `logout`, `logoutAsync`, and `patchUser`.
5. `src/lib/api.ts` injects `Authorization: Bearer <token>` into outgoing Axios requests.

### Feed Flow

1. `/feed` renders `FeedPage` via `src/app/router.tsx`.
2. `FeedPage` uses `useFeed` from `src/features/feed/hooks/useFeed.ts`.
3. `useFeed` calls `getFeed(page, filter, viewerId)` in `src/features/feed/services/feed.service.ts`.
4. `getFeed` performs `GET /feed`, maps each item with `mapPostFromApi` from `src/lib/apiMappers.ts`, and returns pagination metadata.
5. `useFeed` stores posts, loading, refreshing, page, filter, and errors locally.
6. Like toggles optimistically update local post rows, call `togglePostLikeMock`, and reconcile with `GET /posts/:id` through `src/domain/services/postMock.service.ts`.

### Create Post Flow

1. Pages using `FeedLayout` are wrapped by `CreatePostComposerProvider` in `src/features/feed/components/FeedLayout.tsx`.
2. Sidebar/mobile actions open the shared `CreatePostModal` through `useCreatePostComposer`.
3. `CreatePostModal` calls `createPost` in `src/features/feed/services/post.service.ts`.
4. `createPost` validates title/tags/community context, posts to `posts`, and maps the response through `mapPostFromApi`.
5. `runAfterPostCreated` in `src/features/feed/context/CreatePostComposerContext.tsx` refreshes the feed for `/feed` or the current community page for `/communities/:slug`.

### Direct Messages Flow

1. `/messages` and `/messages/:conversationId` render `ConversationsPage` from `src/features/messages/pages/ConversationsPage.tsx`.
2. The page loads conversation lists via `fetchMyConversations` and `fetchPendingReceived`, and loads messages via `fetchConversationMessages` from `src/features/messages/services/messages.service.ts`.
3. Route param `conversationId` becomes local `selectedId`; changing it reloads messages and syncs the SignalR conversation group.
4. `useDirectMessagesSignalR` opens a connection to `getDirectMessagesHubUrl()` from `src/lib/api.ts`, joins `JoinUserInbox`, and joins/leaves `JoinConversation`.
5. SignalR events (`messageCreated`, `messageUpdated`, `messageDeleted`, `conversationUpdated`, `inboxChanged`) merge messages or schedule list reloads in `ConversationsPage`.

### Community Flow

1. `/communities`, `/communities/nova`, `/communities/:communitySlug`, and `/communities/:communitySlug/admin` map to community pages in `src/app/router.tsx`.
2. Community pages call `src/features/communities/services/community.service.ts`.
3. The service validates community payloads, maps API communities/posts/users via `src/lib/apiMappers.ts`, handles `404` as `null` for slug lookup, and raises typed errors such as `ProSubscriptionRequiredError` and `CommunityPostsForbiddenError`.
4. Community premium checkout is delegated from community services to `src/features/subscription/services/billingCheckout.service.ts`.

**State Management:**
- No Redux, Zustand, React Query, or global server-state cache detected.
- Session state: React context plus `localStorage` in `src/features/auth/context/AuthContext.tsx` and `src/features/auth/services/auth.service.ts`.
- Onboarding draft state: React context plus `sessionStorage` in `src/features/auth/onboarding/OnboardingContext.tsx`.
- Composer state: React context scoped to `FeedLayout` in `src/features/feed/context/CreatePostComposerContext.tsx`.
- Page/server state: local component and hook state in feature pages/hooks such as `src/features/feed/hooks/useFeed.ts`, `src/features/messages/pages/ConversationsPage.tsx`, and `src/features/communities/pages/CommunityDetailPage.tsx`.
- Store subscriptions: selected local mock stores expose `useSyncExternalStore` subscriptions, e.g. `src/domain/mocks/postInteractionMockStore.ts`, `src/domain/mocks/communityDraftStore.ts`, and `src/domain/mocks/userDisplayPatchStore.ts`.

## Key Abstractions

**Feature Module:**
- Purpose: Group a product area with pages, components, services, hooks, types, and optional context.
- Examples: `src/features/feed`, `src/features/communities`, `src/features/profile`, `src/features/messages`, `src/features/auth`
- Pattern: Route imports page exports from feature barrels when available; feature internals use relative imports for sibling code and `@/` for shared layers.

**Service Function:**
- Purpose: Encapsulate API calls, validation, DTO mapping, and user-facing errors.
- Examples: `src/features/feed/services/feed.service.ts`, `src/features/communities/services/community.service.ts`, `src/features/messages/services/messages.service.ts`, `src/features/profile/services/profile.service.ts`
- Pattern: Import `api` and `getApiErrorMessage` from `src/lib/api.ts`; map responses with `src/lib/apiMappers.ts`.

**Domain Type:**
- Purpose: Provide stable UI-facing product types independent of raw backend payloads.
- Examples: `src/domain/types.ts`, `src/features/feed/types.ts`, `src/features/profile/types.ts`, `src/features/messages/types.ts`
- Pattern: Shared cross-feature concepts live in `src/domain`; feature-specific contracts stay inside `src/features/<feature>/types.ts`.

**Provider + Hook Pair:**
- Purpose: Expose scoped mutable state and fail fast when used outside its provider.
- Examples: `AuthProvider`/`useAuth` in `src/features/auth/context/AuthContext.tsx`, `OnboardingProvider`/`useOnboardingDraftContext` in `src/features/auth/onboarding/OnboardingContext.tsx`, `CreatePostComposerProvider`/`useCreatePostComposer` in `src/features/feed/context/CreatePostComposerContext.tsx`
- Pattern: Context value is nullable internally; hook throws a clear error if provider is missing.

**Layout Shell:**
- Purpose: Centralize authenticated app chrome and responsive behavior.
- Examples: `src/features/feed/components/FeedLayout.tsx`, `src/features/feed/components/Sidebar.tsx`, `src/features/feed/components/MobileBottomNav.tsx`, `src/features/feed/components/RightPanel.tsx`
- Pattern: Pages render inside `FeedLayout`; pages can disable the right panel or request wide main content with props.

## Entry Points

**HTML Entry:**
- Location: `index.html`
- Triggers: Browser document load.
- Responsibilities: Define root DOM node, fonts, favicon, viewport, and Vite module script.

**React Entry:**
- Location: `src/main.tsx`
- Triggers: Vite module import from `index.html`.
- Responsibilities: Import global styles, create React root, render `App`.

**Application Entry:**
- Location: `src/App.tsx`
- Triggers: React render.
- Responsibilities: Attach React Router through `RouterProvider`.

**Router Entry:**
- Location: `src/app/router.tsx`
- Triggers: `RouterProvider`.
- Responsibilities: Root provider composition, public routes, protected routes, redirects, onboarding child routes.

**Authenticated Layout Entry:**
- Location: `src/features/feed/components/FeedLayout.tsx`
- Triggers: Feature pages under protected routes.
- Responsibilities: Desktop/sidebar/mobile shell, search modal, create-post modal lifecycle, layout scrolling.

## Architectural Constraints

- **Threading:** Browser single-threaded React lifecycle; no Web Workers detected.
- **Routing:** All routes must be added to `src/app/router.tsx`; there is no file-system routing.
- **Provider scope:** `AuthProvider` wraps all routes in `src/app/router.tsx`; `OnboardingProvider` wraps only `/auth/onboarding`; `CreatePostComposerProvider` is only available inside `FeedLayout`.
- **Global state:** Browser storage is used by `src/features/auth/services/auth.service.ts`, `src/lib/api.ts`, and `src/features/auth/onboarding/onboarding.storage.ts`; mutable in-memory mock stores remain under `src/domain/mocks`.
- **API boundary:** Use relative endpoint paths with `src/lib/api.ts`; its interceptor strips leading `/` to preserve the `/api` base URL.
- **Realtime boundary:** Direct-message realtime is limited to `src/features/messages/hooks/useDirectMessagesSignalR.ts`.
- **Path aliases:** Use `@/*` for `src/*` as configured in `tsconfig.app.json` and `vite.config.ts`.
- **Circular imports:** Not detected through static inspection; no circular dependency tooling output was generated.
- **Project skills:** `.cursor/skills` contains GSD workflow skills; no app-specific architecture skill beyond the GSD mapper workflow was detected.

## Anti-Patterns

### Adding API Calls Directly in Components

**What happens:** Components or pages bypass the feature service layer and call Axios directly.
**Why it's wrong:** This duplicates error parsing, base URL handling, token assumptions, and DTO mapping already centralized in `src/lib/api.ts` and `src/lib/apiMappers.ts`.
**Do this instead:** Add or extend a feature service under `src/features/<feature>/services/*.ts`, then consume it from a page or hook, following `src/features/feed/services/feed.service.ts`.

### Adding Routes Inside Feature Components

**What happens:** A feature component defines its own top-level app routes.
**Why it's wrong:** The app has a single route registry in `src/app/router.tsx`; hidden routes make auth guards and redirects inconsistent.
**Do this instead:** Add route entries in `src/app/router.tsx`, export page components from `src/features/<feature>/index.ts` when useful, and wrap protected pages with `ProtectedRoute`.

### Using Create Post Composer Outside FeedLayout

**What happens:** Code calls `useCreatePostComposer` in a tree not wrapped by `FeedLayout`.
**Why it's wrong:** The hook throws if `CreatePostComposerProvider` is absent.
**Do this instead:** Render the page inside `FeedLayout` or introduce a higher-level provider in `src/app/router.tsx` if composer state must become app-global.

### Extending Mock Stores as Primary Architecture

**What happens:** New production behavior is added under `src/domain/mocks` rather than feature services.
**Why it's wrong:** Existing comments mark mock stores as transitional, while active services already call the API for feed, posts, comments, auth, communities, messages, search, and profile.
**Do this instead:** Add REST-backed service functions in `src/features/<feature>/services` and keep `src/domain/mocks` only for compatibility or explicit local-only state.

## Error Handling

**Strategy:** Feature services translate Axios/backend errors into user-facing `Error` messages; pages/hooks store those messages in local state and render alerts, fallback states, or null results.

**Patterns:**
- Use `getApiErrorMessage` from `src/lib/api.ts` for consistent Axios/ProblemDetails parsing.
- Treat expected `404` lookups as `null` in services such as `src/features/profile/services/profile.service.ts` and `src/features/communities/services/community.service.ts`.
- Use typed errors for feature-specific control flow, e.g. `ProSubscriptionRequiredError` and `CommunityPostsForbiddenError` in `src/features/communities/services/community.service.ts`.
- Ignore safe cleanup/network failures in lifecycle code where user action is already complete, e.g. `logoutSessionMock` in `src/features/auth/services/auth.service.ts` and SignalR reconnect cleanup in `src/features/messages/hooks/useDirectMessagesSignalR.ts`.

## Cross-Cutting Concerns

**Logging:** Minimal explicit logging detected. SignalR is configured with `signalR.LogLevel.Warning` in `src/features/messages/hooks/useDirectMessagesSignalR.ts`.

**Validation:** Client-side validation lives in feature services before API calls, e.g. profile updates in `src/features/profile/services/profile.service.ts`, community updates in `src/features/communities/services/community.service.ts`, and post composer constraints in `src/features/feed/services/post.service.ts`.

**Authentication:** JWT token is stored in `localStorage`, injected by the Axios interceptor in `src/lib/api.ts`, and consumed by SignalR through `accessTokenFactory` in `src/features/messages/hooks/useDirectMessagesSignalR.ts`. Route-level auth is enforced by `src/app/ProtectedRoute.tsx`.

**Styling:** Tailwind CSS v4 imports, shadcn CSS, design tokens, and Woody CSS variables are defined in `src/index.css`; reusable class recipes live in `src/lib/woody-ui.ts`; class merging uses `src/lib/utils.ts`.

**External Runtime Configuration:** `.env.development` and `.env.example` are present but were not read. `src/lib/api.ts` expects `VITE_API_BASE_URL` outside development and defaults development API calls to `http://localhost:5000/api`.

---

*Architecture analysis: Monday Apr 27, 2026*
