# Contributing to the PrimeProperty frontend

This repository is the shared foundation for user-facing PrimeProperty UI work. Laravel and the pinned OpenAPI contract remain the source of truth.

## First-time setup

```bash
nvm use
npm ci
cp .env.example .env.local
npm run verify
npm run dev
```

Never commit `.env.local`, secrets, cookies, access tokens, production responses containing personal data, or generated build directories.

## Recommended five-developer model

When all five developers are building one PrimeProperty application, create one product repository from the template. Add all developers as collaborators, and use one short-lived branch per task.

Suggested workstreams minimize overlap but do not create new API capabilities:

1. Application shell, locale behavior, Home, and shared system states.
2. Property Search, Thailand location selectors, filters, pagination, and Property Map.
3. Property Detail, enquiry, sharing, related content, and favorite interactions.
4. Login, registration, password recovery, verification, Profile, avatar, and Newsletter Settings.
5. Articles, legal pages, AI Property Chat, accessibility integration, and cross-feature QA.

Each workstream must follow `docs/ui_elements_guide.md`. Coordinate changes to shared files such as `src/app/layout.tsx`, feature-wide providers, and common components before editing them concurrently.

## Branch and pull-request workflow

1. Pull the latest `main`.
2. Create a focused branch such as `ui/property-search` or `ui/auth-login`.
3. Implement one page, flow, or coherent foundation change.
4. Run `npm run verify`.
5. Push the branch and open a pull request using the repository template.
6. Obtain review and a passing CI check before merging.

Do not commit directly to protected `main`. Keep unrelated refactors out of feature pull requests.

## API integration rules

- Server Components and server-only code may construct `createApiServices(createPublicApiClient())` for cacheable public reads.
- Browser code calls same-origin `/api/*` routes. It must never call the Laravel origin directly.
- Browser code must never read or store a Sanctum token.
- Components do not contain raw upstream endpoint strings or duplicate the centralized API client.
- Use domain types from `@/types`, not direct imports from the giant generated contract.
- Preserve snake-case wire fields, decimal strings, nullable values, ULID property IDs, integer user/article IDs, and Laravel pagination.
- Use TanStack Query for interactive server state and mutations where cancellation/invalidation matters; use native Next.js server fetching for initial public content.
- Laravel 422 responses remain authoritative. Frontend Zod schemas provide only immediate UX validation.
- Unknown OpenAPI structures must be runtime-narrowed. Do not replace `unknown` with guessed interfaces.

## Adding or changing an API operation

Do not add a frontend operation until it exists in the backend contract.

```bash
npm run api:update
npm run verify
```

Review changes to all of the following:

- `docs/api/openapi.json`
- `docs/api/openapi.codegen.json`
- `src/lib/api/generated/schema.ts`
- Endpoint constants, domain aliases, service wrappers, BFF routes, and MSW tests
- `IMPLEMENTED_OPERATION_IDS`, which must continue to match all OpenAPI operations

Production-mutating endpoints must never be called by routine or CI tests.

## Definition of done

- The behavior is present in `docs/ui_elements_guide.md` or the backend contract was intentionally updated first.
- Request methods, fields, queries, auth mode, response shape, nullable fields, and errors are typed.
- Public caching and authenticated `no-store` behavior are correct.
- Loading, empty, 404, 422, 429, 500+, network, cancellation, and session-expiry states are handled as applicable.
- Important actions remain keyboard-accessible and available across viewport sizes.
- Tests cover new service or BFF behavior.
- `npm run verify` passes.

## Repository maintainers

After publishing the template or a derived product repository, configure branch protection for `main`:

- Require pull requests.
- Require the `Verify foundation` CI check.
- Require at least one approval.
- Require conversation resolution.
- Dismiss stale approvals when the diff changes.
- Block force pushes and branch deletion.

Repository collaborators, teams, secrets, environments, and branch protection are GitHub settings and must be configured separately for every derived repository.
