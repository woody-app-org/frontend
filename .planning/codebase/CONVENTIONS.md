# Coding Conventions

**Analysis Date:** Monday Apr 27, 2026

## Naming Patterns

**Files:**
- Use PascalCase for React components and pages: `src/features/feed/components/PostCard.tsx`, `src/features/profile/pages/ProfilePage.tsx`, `src/features/auth/onboarding/steps/OnboardingStepAccount.tsx`.
- Use camelCase plus role suffix for hooks, services, utilities, stores, and mappers: `src/features/feed/hooks/useFeed.ts`, `src/features/feed/services/feed.service.ts`, `src/lib/apiMappers.ts`, `src/domain/mocks/postInteractionMockStore.ts`.
- Use `*.service.ts` for feature-level API/service modules: `src/features/profile/services/profile.service.ts`, `src/features/subscription/services/billingCheckout.service.ts`, `src/features/feed/services/feed.service.ts`.
- Use `*.validation.ts` for validation modules close to the feature flow: `src/features/auth/lib/validation.ts`, `src/features/auth/onboarding/account.validation.ts`, `src/features/auth/onboarding/validation.ts`.
- Use `index.ts` barrel files at feature boundaries only: `src/features/feed/index.ts`, `src/features/auth/index.ts`, `src/features/communities/index.ts`, `src/features/messages/index.ts`.

**Functions:**
- Use camelCase verbs for actions and data access: `getFeed` in `src/features/feed/services/feed.service.ts`, `updateProfile` and `validateProfileUpdatePayload` in `src/features/profile/services/profile.service.ts`.
- Use `use*` for React hooks and context accessors: `useFeed` in `src/features/feed/hooks/useFeed.ts`, `useUserProfile` in `src/features/profile/hooks/useUserProfile.ts`, `useAuth` in `src/features/auth/context/AuthContext.tsx`.
- Use mapper names that state direction/source: `mapPostFromApi` and `mapUserProfileFromApi` in `src/lib/apiMappers.ts`.
- Prefer named exports for functions and components; default exports are limited to app shell files such as `src/App.tsx`.

**Variables:**
- Use boolean prefixes for state: `isLoading`, `isRefreshing`, `hasLoadedOnce`, `hasNextPage`, `hasPreviousPage` in `src/features/feed/hooks/useFeed.ts`.
- Use `error` for `Error | null` and `*Error` / `*Success` for user-facing message strings: `pinActionError`, `pinActionSuccess` in `src/features/profile/hooks/useUserProfile.ts`.
- Use `pending*Ids` and `*Id` for ID tracking: `pendingLikePostIds` in `src/features/feed/hooks/useFeed.ts`, `pinningPostId` in `src/features/profile/hooks/useUserProfile.ts`.
- Use `styles` or `*Styles` objects with `as const` for repeated Tailwind class groups inside components: `styles` in `src/features/auth/components/LoginForm.tsx`, `onboardingStyles` in `src/features/auth/onboarding/uiTokens.ts`.

**Types:**
- Use PascalCase for interfaces/types: `LoginFormProps`, `LoginFormData`, `UseFeedReturn`, `UpdateProfileResult`.
- Keep feature types in local `types.ts` files where shared by the feature: `src/features/feed/types.ts`, `src/features/profile/types.ts`, `src/features/auth/types.ts`.
- Infer form data from Zod schemas: `LoginFormData = z.infer<typeof loginSchema>` in `src/features/auth/lib/validation.ts`, `OnboardingAccountFormData = z.infer<typeof onboardingAccountSchema>` in `src/features/auth/onboarding/account.validation.ts`.

## Code Style

**Formatting:**
- No Prettier configuration detected (`.prettierrc*` not found). Formatting is maintained by the current mixed local style.
- Most application files use double quotes and semicolons: `src/App.tsx`, `src/app/router.tsx`, `src/features/auth/components/LoginForm.tsx`.
- Generated/shadcn-style UI primitives use no semicolons and double quotes are not enforced: `src/components/ui/button.tsx`, `src/lib/utils.ts`.
- Use Tailwind utility classes directly in JSX, composed with `cn` from `src/lib/utils.ts` for conditional or merged classes.
- Prefer reusable class-token helpers before duplicating long class strings: `src/lib/woody-ui.ts`, `src/features/auth/onboarding/uiTokens.ts`, `src/index.css`.

**Linting:**
- ESLint flat config is in `eslint.config.js`.
- Enabled configs: `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-react-hooks` flat recommended, and `react-refresh` Vite config.
- Global ignore list only includes `dist` in `eslint.config.js`.
- Unused variables, args, and caught errors are errors unless prefixed with `_`: `argsIgnorePattern`, `varsIgnorePattern`, and `caughtErrorsIgnorePattern` in `eslint.config.js`.
- TypeScript strictness is enforced by `tsconfig.app.json` and `tsconfig.node.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports`.

## Import Organization

**Order:**
1. External React/library imports first: `react`, `react-router-dom`, `react-hook-form`, `zod`, `lucide-react`.
2. Shared app imports via `@/`: UI primitives, auth context, domain helpers, app libraries.
3. Feature-local relative imports: `../types`, `../services/*`, `./ComponentName`.
4. Type-only imports use `import type` where applicable: `src/features/profile/pages/ProfilePage.tsx`, `src/features/feed/components/PostCard.tsx`.

**Path Aliases:**
- `@/*` maps to `src/*` in `tsconfig.app.json`, `tsconfig.json`, and `vite.config.ts`.
- Use `@/` for cross-feature or shared imports: `@/features/auth/context/AuthContext`, `@/components/ui/button`, `@/lib/utils`.
- Use relative imports inside the same feature subtree when close by: `../components/FeedLayout` in `src/features/feed/pages/FeedPage.tsx`, `../types` in `src/features/feed/services/feed.service.ts`.

## Error Handling

**Patterns:**
- API services catch unknown errors and rethrow normalized `Error` instances with `getApiErrorMessage`: `src/features/feed/services/feed.service.ts`, `src/features/profile/services/profile.service.ts`, `src/features/subscription/services/billingCheckout.service.ts`.
- Components/hooks store `Error | null` for load failures and string messages for user action feedback: `src/features/feed/hooks/useFeed.ts`, `src/features/profile/hooks/useUserProfile.ts`.
- User-edit service operations that can fail validation return discriminated results instead of throwing: `UpdateProfileResult` in `src/features/profile/services/profile.service.ts`.
- Expected 404s can return `null` instead of throwing: `getProfile` in `src/features/profile/services/profile.service.ts`.
- Context hooks fail fast when used outside providers: `useAuth` throws in `src/features/auth/context/AuthContext.tsx`.
- Silent catch blocks are used for non-critical UI refresh/pagination failures; keep a comment when state is intentionally preserved: `src/features/profile/hooks/useUserProfile.ts`.

## Logging

**Framework:** console

**Patterns:**
- No structured logging framework detected.
- Avoid adding `console.log` in product paths; existing debug callbacks appear in pin placeholders in `src/features/feed/pages/FeedPage.tsx` and `src/features/communities/components/CommunityFeed.tsx`.
- Prefer user-visible error state, returned `{ ok: false, error }`, or thrown normalized `Error` over console-only failures.

## Comments

**When to Comment:**
- Comment when documenting backend contract assumptions or migration points: `src/features/feed/services/feed.service.ts`, `src/lib/api.ts`, `src/domain/lib/commentThreads.ts`.
- Comment when a lint exception preserves a deliberate local pattern: `src/features/auth/context/AuthContext.tsx`, `src/components/ui/button.tsx`.
- Keep TODOs actionable and scoped to backend integration seams: `src/domain/mocks/postInteractionMockStore.ts`, `src/features/feed/components/post-detail/ReplyForm.tsx`.
- Avoid comments for self-evident JSX or simple state assignments.

**JSDoc/TSDoc:**
- Used selectively for exported contracts and behavior notes: `getApiOrigin` in `src/lib/api.ts`, `UseFeedReturn.registerNewPostFromComposer` in `src/features/feed/hooks/useFeed.ts`, CPF helpers in `src/features/auth/onboarding/account.validation.ts`.
- Use Portuguese for user/domain-facing comments where the surrounding module is Portuguese; English is acceptable for generic React/TypeScript technical names.

## Function Design

**Size:** 
- Keep UI components focused on one page/section/component responsibility. Large page components such as `src/features/feed/pages/FeedPage.tsx` and `src/features/communities/pages/CommunityDetailPage.tsx` coordinate feature flows and should delegate reusable pieces to `components/`.
- Keep data fetching and mutation logic in hooks or services, not deeply embedded in presentational components: `src/features/feed/hooks/useFeed.ts`, `src/features/profile/services/profile.service.ts`.

**Parameters:** 
- Prefer typed payload objects for create/update operations: `ProfileUpdatePayload` in `src/features/profile/types.ts`.
- Pass primitive pagination/filter inputs to read services: `getFeed(page, filter, viewerId)` in `src/features/feed/services/feed.service.ts`.
- Use optional props with defaults in component destructuring: `createAccountTo = "/auth/onboarding/1"` in `src/features/auth/components/LoginForm.tsx`.

**Return Values:** 
- Hooks return stable objects containing state plus callbacks: `useFeed` in `src/features/feed/hooks/useFeed.ts`, `useUserProfile` in `src/features/profile/hooks/useUserProfile.ts`.
- Services either return mapped domain data or discriminated result objects; do not leak raw Axios responses into components: `src/features/profile/services/profile.service.ts`, `src/features/feed/services/feed.service.ts`.
- Validation helpers return `{ ok: true } | { ok: false; error: string }` when validation is invoked outside React Hook Form: `validateProfileUpdatePayload` in `src/features/profile/services/profile.service.ts`.

## Validation

**Forms:**
- Use `react-hook-form` with `zodResolver` for form validation: `src/features/auth/components/LoginForm.tsx`, `src/features/auth/onboarding/steps/OnboardingStepAccount.tsx`, `src/features/auth/onboarding/steps/OnboardingStepVerifyEmail.tsx`.
- Keep Zod schemas next to the feature flow and export inferred data types: `src/features/auth/lib/validation.ts`, `src/features/auth/onboarding/account.validation.ts`.
- Use `noValidate` on forms and display field-level messages from `form.formState.errors`: `src/features/auth/components/LoginForm.tsx`, `src/features/auth/onboarding/steps/OnboardingStepAccount.tsx`.
- Use `Controller` for formatted/controlled inputs such as CPF masking: `src/features/auth/onboarding/steps/OnboardingStepAccount.tsx`.

**API/Data:**
- Normalize API response shapes with mapper utilities before setting React state: `src/lib/apiMappers.ts`, `src/features/feed/services/feed.service.ts`, `src/features/profile/services/profile.service.ts`.
- Use `encodeURIComponent` for route params sent to API endpoints: `src/features/profile/services/profile.service.ts`.

## Component Organization

**Feature folders:**
- Put route/page components in `src/features/<feature>/pages/`.
- Put reusable feature UI in `src/features/<feature>/components/`.
- Put data hooks in `src/features/<feature>/hooks/`.
- Put API/data modules in `src/features/<feature>/services/`.
- Put feature-specific validation/copy/constants near the feature: `src/features/auth/onboarding/account.validation.ts`, `src/features/subscription/constants.ts`, `src/features/landing/constants.ts`.

**Shared UI and libraries:**
- Shared UI primitives live in `src/components/ui/` and follow shadcn/Radix composition patterns: `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`.
- Shared app utilities live in `src/lib/`: `src/lib/api.ts`, `src/lib/utils.ts`, `src/lib/woody-ui.ts`, `src/lib/socialGraphEvents.ts`.
- Domain mocks and selectors live in `src/domain/`: `src/domain/mocks/`, `src/domain/selectors.ts`, `src/domain/services/platformMock.service.ts`.

## Module Design

**Exports:** 
- Prefer named exports from modules and feature barrels.
- Feature barrels should expose route pages, reusable feature components, hooks, and public types: `src/features/feed/index.ts`, `src/features/communities/index.ts`, `src/features/profile/index.ts`.
- Avoid exporting every internal helper; keep implementation helpers private unless reused across files.

**Barrel Files:** 
- Use feature-level `index.ts` files for route imports in `src/app/router.tsx`.
- Do not create broad root-level barrels for all app modules; import shared modules directly via `@/lib/*`, `@/components/ui/*`, or feature paths.

---

*Convention analysis: Monday Apr 27, 2026*
