# PrimeProperty frontend foundation

PrimeProperty is a Next.js App Router frontend foundation for the existing Laravel API. This phase contains the API contract, typed domain services, secure browser-to-backend integration, validation, caching policy, and tests. It intentionally contains no application design or production pages.

## Requirements

- Node.js 22 or newer
- npm
- A reachable PrimeProperty Laravel API for runtime requests

Install and verify the project:

```bash
npm install
cp .env.example .env.local
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment

The upstream API URL is server-only. Do not rename it to a `NEXT_PUBLIC_*` variable: browsers should call the same-origin `/api/*` route handlers, not Laravel directly.

```env
PRIMEPROPERTY_API_URL=https://primeproperty.cfd/api/v1
PRIMEPROPERTY_SESSION_COOKIE=primeproperty_session
```

Environment parsing is centralized in `src/config/env.ts`. Production must use HTTPS so the session cookie receives the `Secure` attribute.

## Sources of truth

The versioned contract is `docs/api/openapi.json`. The project also keeps `docs/api/llms.txt` and `docs/api/guest-flow.json` as behavioral references. The OpenAPI wire format takes priority when the sources differ.

The upstream OpenAPI document currently contains two structurally invalid empty-array schema placeholders. `scripts/normalize-openapi.mjs` changes only those placeholders to empty schemas in `docs/api/openapi.codegen.json`, causing generated TypeScript to use `unknown`. It does not invent response fields.

Refresh the contract intentionally:

```bash
npm run api:update
```

Or regenerate types from the committed snapshot without network access:

```bash
npm run api:types
```

Review the OpenAPI diff and generated type diff together before committing an API update.

## Architecture

```text
docs/
├── api/                       # Pinned OpenAPI and behavioral references
└── ui_elements_guide.md       # Contract-bounded functional UI inventory
scripts/                       # Contract sync and deterministic normalization
src/
├── app/
│   ├── api/                   # Same-origin BFF route handlers
│   ├── layout.tsx
│   └── page.tsx               # Compile-only placeholder
├── config/                    # Validated environment and cache policy
├── features/                  # Feature query keys and future feature-local code
├── lib/
│   ├── api/                   # HTTP client, errors, generated contract, query encoder
│   ├── auth/                  # HttpOnly session-cookie codec
│   ├── bff/                   # Route parsing, origin checks, responses, service factories
│   └── query/                 # Selective TanStack Query configuration
├── schemas/                   # UX-oriented Zod validation
├── services/                  # One domain wrapper for every OpenAPI operation
└── types/                     # Ergonomic domain aliases over generated types
tests/                         # Unit, contract, BFF, and opt-in live smoke tests
```

The dependency direction is:

```text
route or Server Component -> domain service -> ApiClient -> Laravel API
browser feature           -> /api BFF route -> domain service -> Laravel API
generated contract        -> domain aliases and service signatures
```

Feature code should not import the giant generated schema directly. Import domain types from `@/types`, and create operations through `createApiServices`.

## API client

`ApiClient` owns URL construction, query encoding, JSON and multipart bodies, bearer authorization, cancellation, cache directives, and error normalization.

For server-rendered public data:

```ts
import { createPublicApiClient } from "@/lib/api/server-client";
import { createApiServices } from "@/services";

const services = createApiServices(createPublicApiClient());
const properties = await services.properties.list({
  locale: "th",
  listing_type: "sale",
  page: 1,
});
```

Every service accepts an optional request-options argument containing `signal`, `cache`, `revalidate`, and cache tags where appropriate. Default policies are centralized:

- Reference/configuration data: 60 minutes
- Home/editorial content: 5 minutes
- Public property reads: 60 seconds
- Authenticated reads and every mutation: `no-store`

Optional-auth public property methods may return `is_favorited` when a token is supplied. Never put an authenticated response in a shared cache. Server Components should fetch public SEO data anonymously, then obtain private state through `/api/*` or another authenticated no-store request.

## Browser requests and TanStack Query

Browser code calls same-origin routes such as `/api/properties`, `/api/session`, and `/api/favorites/{property}`. This keeps the upstream URL and Sanctum token out of browser JavaScript.

TanStack Query is available for interactive search, authenticated reads, and mutations. Query keys are feature-local under `src/features`. It is not needed for static Server Component reads.

```ts
import { useQuery } from "@tanstack/react-query";
import { propertyQueryKeys } from "@/features/properties/query-keys";

const params = { listing_type: "rent", page: 1 } as const;

useQuery({
  queryKey: propertyQueryKeys.list(params),
  queryFn: async ({ signal }) => {
    const response = await fetch(`/api/properties?listing_type=rent&page=1`, { signal });
    if (!response.ok) throw await response.json();
    return response.json();
  },
});
```

Mount `QueryProvider` around the portion of the future application that needs client-side server state. No unrelated global state store is included.

## Authentication flow

Laravel Sanctum returns one 30-day personal access token per device. The frontend uses a same-origin backend-for-frontend (BFF) flow:

1. The browser posts credentials and `device_name` to `/api/auth/login`, `/api/auth/register`, or `/api/auth/google`.
2. The route forwards the validated body to Laravel.
3. The route stores `access_token`, `expires_at`, and `device_name` in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
4. The browser receives only the safe user/session envelope; `access_token` is stripped.
5. Protected BFF routes read the cookie server-side and add the bearer header upstream.
6. Current-device or all-device logout clears the cookie. Any authenticated upstream 401 also clears it.

Unsafe cookie-authenticated requests enforce `Origin`/`Host` consistency and reject cross-site fetch metadata. New mutation routes must call `assertSameOrigin` before reading a body or forwarding a request.

The `/api/session` endpoint combines the live `/me` response with safe cookie metadata. It exposes user, expiry, device name, and verification state where available, never the Sanctum token.

## Errors and Laravel validation

All non-success responses become `ApiError` with:

- `status`
- `kind`: network, authentication, authorization, validation, not-found, rate-limit, server, or unknown
- optional backend `code`
- optional Laravel `errors: Record<string, string[]>`
- optional `retryAfter` seconds from `Retry-After`

Form-facing helpers are available from `@/lib/api/errors`:

```ts
try {
  await services.profile.update(input);
} catch (error) {
  if (isValidationError(error)) {
    const emailMessage = getFieldError(error, "email");
    const firstMessage = getFirstValidationError(error);
  }
}
```

An aborted request remains an `AbortError`; it is not mislabeled as a network failure.

## Property query contract

`PropertySearchParams` supports only the documented filters: locale, text query, listing/property/project type, province/district/subdistrict codes, price range, minimum bedrooms and bathrooms, facilities, six quick filters, sort, page, and page size. `PropertyMapParams` replaces pagination with north/south/east/west bounds.

The encoder:

- sends facilities as repeated `facility_ids[]` keys;
- retains `false` and numeric zero;
- omits undefined, null, empty strings, and empty arrays;
- validates that district requires province and subdistrict requires district.

The map API can return at most 500 markers.

## Types and naming

- Keep Laravel's snake-case names at the wire boundary. Do not silently camel-case responses.
- Preserve decimal prices and sizes as strings.
- Preserve nullable fields.
- Property identifiers are ULID strings; user and article identifiers are integers.
- Preserve Laravel pagination envelopes exactly.
- Use `unknown` for unspecified contract content and narrow it near the consumer.
- Use PascalCase for types, camelCase for functions, and kebab-case for route folders.
- Name service methods by intent (`getBySlug`, `recordView`) while endpoint constants retain the exact URL contract.

## Adding an endpoint

1. Update and review `docs/api/openapi.json`.
2. Run `npm run api:types`.
3. Add the URL to `src/lib/api/endpoints.ts`.
4. Add a typed method to the appropriate domain service, using generated `JsonRequest`, `JsonResponse`, and `OperationQuery` helpers.
5. Add the operation ID to `IMPLEMENTED_OPERATION_IDS`.
6. If browser access is needed, add a narrow BFF route with schema parsing, same-origin protection for unsafe methods, and the correct auth mode.
7. Add MSW contract coverage and error-state tests.
8. Document newly supported user functionality in `docs/ui_elements_guide.md`.

Do not add an endpoint based only on a desired UI. It must exist in the pinned contract.

## Adding a feature

Create `src/features/<feature>` only when behavior belongs to that business capability. Typical contents are query keys, client hooks, feature-specific schemas, utilities, and constants. Shared HTTP behavior stays in `src/lib/api`; wire operations stay in `src/services`; cross-feature domain aliases stay in `src/types`.

A feature should use:

- native Next.js server fetching for cacheable initial public content;
- a same-origin BFF route for browser mutations and private data;
- TanStack Query where interaction benefits from cancellation, invalidation, or mutation state;
- Zod for immediate UX checks while Laravel remains validation authority.

## API coverage and known gaps

The service layer covers all 40 operations in the pinned contract. Contract gaps are deliberately visible:

- `GenericDataEnvelope.data`, `ChatEnvelope.items`, and several nested property/home/contact objects are unspecified and therefore typed `unknown`.
- There are no user-facing APIs for standalone agent or agency profiles, owner profiles, comparison persistence, enquiry history, appointments, listing management, notifications, payments, packages, contracts, or transactions.
- There are no admin, staff, moderation, reporting, or configuration operations.
- No map provider is selected by the API contract.

See `docs/ui_elements_guide.md` for the resulting product boundary.

## Tests

```bash
npm run test
```

The default suite is deterministic and never mutates production. It covers query encoding, location dependencies, error normalization, cancellation, OpenAPI operation coverage, Laravel pagination, nullable/empty states, multipart uploads, favorites semantics, required/optional auth, cookie creation, token stripping, same-origin checks, forwarding, and 401 cleanup.

An explicit read-only production smoke test is available:

```bash
npm run test:contract:live
```

It only performs public GET requests. Routine tests never call enquiries, chat, views, auth creation, favorites, or any other production mutation.
