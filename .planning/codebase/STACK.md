# Technology Stack

**Analysis Date:** Monday Apr 27, 2026

## Languages

**Primary:**
- TypeScript 5.9.3 - application source in `src/**/*.ts` and `src/**/*.tsx`, with strict compiler settings in `tsconfig.app.json`.
- TSX / React JSX - page, feature, and UI component implementation under `src/app`, `src/features`, and `src/components`.

**Secondary:**
- CSS - global Tailwind v4 theme, CSS variables, and animation imports in `src/index.css`.
- HTML - Vite shell entry in `index.html`.
- JavaScript / ESM config - tool configuration in `eslint.config.js`, `postcss.config.js`, and `vite.config.ts`.

## Runtime

**Environment:**
- Browser SPA runtime - mounted from `src/main.tsx` into `index.html`.
- Node.js for local tooling - exact version not pinned; no `.nvmrc` or `engines` field detected in `package.json`.

**Package Manager:**
- npm - inferred from `package-lock.json`.
- Lockfile: present at `package-lock.json` with lockfileVersion 3.

## Frameworks

**Core:**
- React 19.2.0 - component runtime, state hooks, context providers, and SPA UI (`src/main.tsx`, `src/App.tsx`, `src/app/router.tsx`).
- React DOM 19.2.0 - root rendering through `createRoot` in `src/main.tsx`.
- React Router DOM 7.13.0 - browser routing via `createBrowserRouter` and `RouterProvider` in `src/app/router.tsx` and `src/App.tsx`.
- Vite 7.3.1 - dev server and production bundler configured in `vite.config.ts`.

**Testing:**
- Not detected - no Jest, Vitest, Cypress, Playwright, or test script detected in `package.json`.

**Build/Dev:**
- TypeScript build mode - `npm run build` runs `tsc -b` before `vite build` as defined in `package.json`.
- `@vitejs/plugin-react` 5.1.1 - React Fast Refresh plugin configured in `vite.config.ts`.
- ESLint 9.39.1 with flat config - linting configured in `eslint.config.js`.
- Tailwind CSS 4.2.0 - CSS-first theme and utility system imported from `src/index.css`.
- PostCSS 8.5.6 with `@tailwindcss/postcss` 4.2.0 - configured in `postcss.config.js`.
- shadcn 3.8.5 - UI generator/configuration in `components.json`.

## Scripts

Use npm scripts from `package.json`:

```bash
npm run dev       # Vite dev server
npm run build     # TypeScript project build plus Vite production build
npm run lint      # ESLint over the repo
npm run preview   # Vite preview server
```

No package script for tests, formatting, typecheck-only, or coverage is defined in `package.json`.

## Key Dependencies

**Critical:**
- `react` 19.2.0 and `react-dom` 19.2.0 - core frontend runtime.
- `react-router-dom` 7.13.0 - SPA route tree and protected page routing in `src/app/router.tsx`.
- `axios` 1.13.5 - shared HTTP client in `src/lib/api.ts`.
- `@microsoft/signalr` 9.0.6 - real-time direct-message connection in `src/features/messages/hooks/useDirectMessagesSignalR.ts`.
- `zod` 4.3.6 - login and onboarding validation schemas in `src/features/auth/lib/validation.ts` and `src/features/auth/onboarding/account.validation.ts`.
- `react-hook-form` 7.71.2 and `@hookform/resolvers` 5.2.2 - auth/onboarding forms such as `src/features/auth/components/LoginForm.tsx`.

**Infrastructure:**
- `tailwindcss` 4.2.0 - global design system and utility classes in `src/index.css`.
- `shadcn` 3.8.5, `radix-ui` 1.4.3, and `lucide-react` 0.575.0 - component primitives, generated UI configuration, and icon system (`components.json`, `src/components/ui`).
- `class-variance-authority`, `clsx`, and `tailwind-merge` - class composition pattern exposed through `cn()` in `src/lib/utils.ts`.
- `tw-animate-css` 1.4.0 - animation utilities imported in `src/index.css`.

## UI Patterns

**Design system:**
- Use Tailwind v4 CSS variables from `src/index.css`; Woody brand tokens include `--woody-lime`, `--woody-text`, `--woody-card`, `--woody-divider`, and layout variables such as `--layout-max-width`.
- Use shared visual constants from `src/lib/woody-ui.ts` for cards, focus rings, section headings, page spacing, badges, and scrollable dialogs.
- Use `cn()` from `src/lib/utils.ts` to merge conditional classes and avoid conflicting Tailwind utilities.

**Component primitives:**
- shadcn-style primitives live in `src/components/ui`: `button.tsx`, `input.tsx`, `textarea.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `avatar.tsx`, `card.tsx`, and `skeleton.tsx`.
- `components.json` sets `style: "new-york"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`, and aliases such as `@/components`, `@/components/ui`, and `@/lib/utils`.

**Fonts and assets:**
- Google Fonts `Lora` and `Plus Jakarta Sans` are loaded in `index.html`.
- The app favicon points at `src/assets/cat.svg` from `index.html`.

## Configuration

**Environment:**
- `VITE_API_BASE_URL` is the only detected Vite environment variable, consumed by `src/lib/api.ts`.
- `.env.example` and `.env.development` are present; contents were not read because env files may contain secrets.
- In development, `src/lib/api.ts` defaults to `http://localhost:5000/api` when `VITE_API_BASE_URL` is absent.
- In non-development builds, `src/lib/api.ts` throws if `VITE_API_BASE_URL` is not set.

**Build:**
- `vite.config.ts` enables React and aliases `@` to `src`.
- `tsconfig.json` defines project references and the `@/*` path alias.
- `tsconfig.app.json` targets ES2022, uses `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `strict: true`, and includes `src`.
- `tsconfig.node.json` exists for Node-side TypeScript config.
- `postcss.config.js` loads `@tailwindcss/postcss`.
- `eslint.config.js` applies recommended JS, TypeScript, React Hooks, and React Refresh rules to `**/*.{ts,tsx}`.
- `vercel.json` rewrites all paths to `/index.html` for SPA routing.

## Platform Requirements

**Development:**
- Install dependencies with npm using `package-lock.json`.
- Run `npm run dev` for local Vite.
- Backend API is expected at `VITE_API_BASE_URL` or `http://localhost:5000/api` during Vite development.

**Production:**
- Static SPA build from `vite build`.
- Vercel is configured through `vercel.json` SPA rewrites.
- `VITE_API_BASE_URL` must be configured at build/deploy time.

---

*Stack analysis: Monday Apr 27, 2026*
