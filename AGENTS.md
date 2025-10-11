# Repository Guidelines

## Project Structure & Module Organization
HabitNex is a Next.js 14 workspace. Routes and server components live in `app/` (dashboard, family, settings). Shared UI sits in `components/` with atoms under `components/ui`. Keep domain logic in `lib/` and `hooks/`, and types in `types/`. Static assets stay in `public/` with global styles in `app/globals.css`. Playwright suites live in `tests/` with fixtures in `tests/helpers/`, and scripts belong in `scripts/`. Add new code beside the feature it supports to keep navigation predictable.

## Build, Test, and Development Commands
Install dependencies with `npm install`, then start the app through `npm run dev`. Use `npm run dev:safe` when you need the guarded diagnostic startup. Build with `npm run build` and preview with `npm run start`. Enforce lint rules via `npm run lint`. Run the regression suite using `npm run test`; switch to `npm run test:headed` or `npm run test:ui` to debug interactively. Deploy with `npm run deploy`, which chains the build and Firebase hosting/Firestore deploy.

## Coding Style & Naming Conventions
Write TypeScript modules with two-space indentation and omit semicolons unless required. Components are PascalCase (`ProgressRing.tsx`), hooks camelCase (`useFamilySync.ts`), and route folders kebab-case. Prefer named exports for shared code and reserve default exports for Next route entries. Order Tailwind classes from layout to visuals, and always run `npm run lint` before committing.

## Testing Guidelines
Playwright specs in `tests/` cover authentication, dashboard flows, performance, and themes. Name new suites `<feature>.spec.ts`; keep `.test.js` only when extending legacy helpers. Reuse utilities from `tests/helpers/` to avoid duplicate sign-in logic. Capture visual updates with `npm run test:headed` and review artifacts in `tests/screenshots/` or the HTML report. Changes touching sign-in, family sync, or habit editing must run the relevant specs and receive a local smoke check.

## Commit & Pull Request Guidelines
Commits follow short, imperative subjects such as `Add historical habit editing`; keep them under 72 characters and group logical changes. Pull requests need a purpose summary, linked issue, screenshots or recordings for UI updates, and a validation note covering `npm run lint`, `npm run test`, and manual steps. Tag owners of affected routes or modules, and call out telemetry or Firebase adjustments explicitly.

## Security & Configuration Tips
Secrets stay in `.env.local`; never commit Firebase keys or service credentials. Document new environment variables in `README.md` with safe defaults. Before `npm run deploy`, verify Firestore rule or index updates locally with the Firebase CLI.
