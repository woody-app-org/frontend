# Testing Patterns

**Analysis Date:** Monday Apr 27, 2026

## Test Framework

**Runner:**
- Not detected. No `vitest.config.*`, `jest.config.*`, or `playwright.config.*` file was found in the frontend repo.
- `package.json` does not define a `test` script.
- `package.json` devDependencies do not include Vitest, Jest, Testing Library, Playwright, Cypress, or jsdom.
- Config: Not applicable.

**Assertion Library:**
- Not detected.

**Run Commands:**
```bash
npm run lint          # Run ESLint over the repo
npm run build         # Run TypeScript project build and Vite production build
npm run dev           # Start local Vite dev server for manual verification
```

## Test File Organization

**Location:**
- Not detected. No `*.test.*` or `*.spec.*` files were found under the repo during mapping.
- No dedicated `tests/`, `__tests__/`, or `e2e/` directory was detected.

**Naming:**
- Not applicable until a test framework is added.
- Recommended local fit: co-locate tests beside feature modules as `ComponentName.test.tsx`, `useHookName.test.ts`, or `serviceName.test.ts` to match the existing feature-folder organization in `src/features/`.

**Structure:**
```text
src/
├── features/
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── pages/
│       └── types.ts
└── lib/
```

## Test Structure

**Suite Organization:**
```typescript
// No existing automated test suite detected.
// Suggested structure when tests are introduced:
describe("feature behavior", () => {
  it("returns mapped data or renders user-visible state", async () => {
    // Arrange feature data/mocks
    // Act through the public hook, component, or service
    // Assert user-visible output or returned domain shape
  });
});
```

**Patterns:**
- Existing verification is configuration-based rather than test-based: `npm run lint` uses `eslint.config.js`, and `npm run build` runs `tsc -b && vite build` from `package.json`.
- TypeScript strictness provides static coverage for unused locals/params, strict types, fallthrough cases, and side-effect imports through `tsconfig.app.json` and `tsconfig.node.json`.
- Manual verification should exercise routed flows declared in `src/app/router.tsx`: auth/onboarding, feed, messages, communities, profiles, and subscription pages.

## Mocking

**Framework:** Not detected

**Patterns:**
```typescript
// Existing app code uses in-memory/mock domain stores, not a test mocking framework.
// Examples: domain mock stores emit subscription/version changes consumed by hooks.
```

**What to Mock:**
- API calls made through `api` from `src/lib/api.ts` when testing services such as `src/features/feed/services/feed.service.ts`, `src/features/profile/services/profile.service.ts`, and `src/features/subscription/services/billingCheckout.service.ts`.
- Browser APIs used by auth and API helpers, especially `localStorage` in `src/lib/api.ts` and auth storage services under `src/features/auth/services/`.
- React Router context when testing route-aware pages from `src/features/*/pages/`.
- Domain mock stores when testing hooks that subscribe via `useSyncExternalStore`, such as `src/features/feed/hooks/useFeed.ts`.

**What NOT to Mock:**
- Do not mock Zod schemas when testing forms; validate through real schemas in `src/features/auth/lib/validation.ts` and `src/features/auth/onboarding/account.validation.ts`.
- Do not mock simple class composition helpers such as `cn` in `src/lib/utils.ts`.
- Do not mock feature mappers unless the unit under test is explicitly independent from API shape normalization; services should exercise mapper integration in `src/lib/apiMappers.ts`.

## Fixtures and Factories

**Test Data:**
```typescript
// No dedicated test fixtures detected.
// Current reusable sample data lives in app/domain mock modules.
```

**Location:**
- Domain mock stores and services live in `src/domain/mocks/` and `src/domain/services/`.
- Feature-specific mock actions live near the flow, for example `src/features/auth/onboarding/services/onboardingActionsMock.ts`.
- If automated tests are introduced, keep test-only fixtures out of production mocks, either next to tests or in a dedicated `src/test/` helper area.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
```bash
# Not available: no coverage tool or script configured in package.json.
```

**Coverage Observed:**
- Static coverage only: TypeScript strict project build and ESLint.
- No unit, integration, component, or E2E coverage artifacts were detected.
- No `coverage/` output directory was detected.

## Test Types

**Unit Tests:**
- Not used currently.
- Highest-value unit candidates are pure validation/mapping helpers: `src/features/auth/onboarding/account.validation.ts`, `src/features/auth/lib/validation.ts`, `src/lib/apiMappers.ts`, `src/lib/api.ts`, `src/features/profile/services/profile.service.ts`.

**Integration Tests:**
- Not used currently.
- Highest-value integration candidates are hooks/services that coordinate state and API/mocks: `src/features/feed/hooks/useFeed.ts`, `src/features/profile/hooks/useUserProfile.ts`, `src/features/messages/pages/ConversationsPage.tsx`, `src/features/communities/pages/CommunityDetailPage.tsx`.

**E2E Tests:**
- Not used currently.
- Highest-value browser flows are defined in `src/app/router.tsx`: onboarding steps, login, protected feed, profile editing, communities, messages, and subscription checkout entry points.

## Common Patterns

**Async Testing:**
```typescript
// No existing async test pattern detected.
// App async code generally follows:
// set loading state -> await service -> set data -> catch normalized Error/string -> finally clear loading.
```

**Error Testing:**
```typescript
// No existing error test pattern detected.
// Error behavior to cover first:
// getApiErrorMessage(err, fallback) in src/lib/api.ts
// service catch/rethrow in src/features/feed/services/feed.service.ts
// discriminated { ok: false, error } results in src/features/profile/services/profile.service.ts
```

## Verification Commands

**Static checks:**
```bash
npm run lint
npm run build
```

**Manual local run:**
```bash
npm run dev
```

**Package manager:**
- npm is used; `package-lock.json` is present.

**Environment notes:**
- `.env.example` exists and documents `VITE_API_BASE_URL`, but secret-bearing `.env*` files were not read during this mapping.
- `src/lib/api.ts` defaults development API traffic to `http://localhost:5000/api` when `VITE_API_BASE_URL` is unset.

## Gaps and Risks

**Automated tests missing:**
- No test runner, test scripts, assertion library, DOM test environment, or test files are configured.
- Form validation, API error normalization, auth context, protected routes, and optimistic UI state can regress without automated feedback.

**CI visibility:**
- Frontend-specific test CI was not detected in the explored frontend files.
- `.github/workflows/` exists, but no frontend test command is exposed by `package.json`.

**Manual QA needed:**
- Run `npm run lint` and `npm run build` before shipping frontend changes.
- Manually verify protected routes in `src/app/router.tsx` and feature flows touched by a change.
- For changes touching API services, verify backend availability or mock behavior because `src/lib/api.ts` requires a reachable API base in production builds.

---

*Testing analysis: Monday Apr 27, 2026*
