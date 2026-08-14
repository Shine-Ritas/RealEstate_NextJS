# PrimeProperty functional UI elements guide

## Page inventory

```text
Public website
├── Home
├── Property Search
├── Property Map
├── Property Detail
│   └── Property Enquiry
├── Article Index
├── Article Detail
├── Privacy Policy
├── Terms and Conditions
└── AI Property Chat

Authentication
├── Login
│   └── Google Login
├── Register
├── Forgot Password
├── Reset Password
└── Email Verification

Authenticated user account
├── Profile and Account Settings
├── Favorites
└── Newsletter Settings
```

This inventory contains only experiences supported by the pinned PrimeProperty OpenAPI contract and the implemented frontend services. It intentionally excludes standalone agent and agency pages, property comparison, enquiry history, viewing appointments, user listing management, recently viewed lists, notifications, payments, contracts, transactions, and all back-office functionality because no corresponding user-facing API exists.

## Scope and source of truth

This document defines what information, controls, actions, permissions, and states the user-facing application needs. It does not define appearance, styling, animation, theme, or final layout.

The sources of truth are:

1. `docs/api/openapi.json` for methods, paths, request fields, response fields, authentication, and status codes.
2. The typed wrappers in `src/services` for frontend API availability.
3. The HttpOnly BFF routes in `src/app/api` for browser-safe authentication and mutation access.
4. `docs/api/guest-flow.json` and `docs/api/llms.txt` for supported behavior where they do not conflict with OpenAPI.

The API exposes two user permission states: guest and authenticated client. It does not expose owner, agent, staff, or administrator authorization roles. An `Agent` may appear as a nested public summary, but an agent cannot be treated as a signed-in role or standalone resource.

## Public website

## Home

### Purpose

Help a visitor begin property discovery and access backend-curated active properties, locations, content, and optional public summaries.

### Intended Users

- Guest
- Authenticated client
- Property seeker

### Required Data

- Application, feature, locale, layout, navigation, footer, and authentication configuration from the bootstrap response.
- Home layout identifier: `guest` or `guest_v2`.
- Required `property_sections`, each with `key`, `title_key`, and property summaries.
- Optional hero media, call-to-action media, location media, testimonials, and nested top-agent summaries.
- Translation dictionary for the active locale when application strings are backend-managed.
- Optional current session state for account-aware navigation.

### Core UI Elements

- Primary property search entry.
- Buy/rent selector mapped to `listing_type` values supported by property search.
- Property type selector populated from property options.
- Thailand location selector using the supported province, district, and subdistrict hierarchy.
- Backend-provided property sections. Their labels and business meaning come from `key` and `title_key`; the frontend must not assume every section means featured, latest, popular, or recommended.
- Optional hero and call-to-action media when returned.
- Optional location discovery entries from `location_media`.
- Optional testimonial content when returned.
- Optional top-agent summaries when returned. These can expose only the nested agent data and contact capabilities supplied by the response; they cannot link to a standalone agent page.
- Login/register entry points for guests and profile/favorites entry points for authenticated clients.
- Language selector using the discovered locales.

### Primary Actions

- Start a property search.
- Choose sale or rent discovery.
- Open an active property detail page.
- Open a backend-provided location or navigation destination.

### Secondary Actions

- Change locale.
- Open a published article if supplied by navigation or backend-curated content.
- Use a returned agent contact value when it is safe and present.
- Log in, register, or open the authenticated account.

### Conditional Elements

- Render hero, call-to-action, locations, testimonials, top agents, and each property section only when supplied.
- Use the returned `features` flags and `navigation` configuration only after narrowing their currently underspecified object shapes.
- Show private favorite state only from an authenticated no-store request. Do not place token-derived state in a shared home-page cache.
- Do not show agency discovery, owner-listing calls to action, or recently viewed properties because those workflows are unsupported.

### States

- Initial bootstrap loading.
- Home-content loading or background revalidation.
- Partial content where optional sections are absent.
- Empty `property_sections` content.
- Unsupported or unavailable locale with a supported-locale fallback.
- Authentication unknown, guest, authenticated, or expired.
- Network, rate-limit, and server errors while preserving search and retry access.

### API Dependencies

- `service.discover()` → `GET /`
- `service.getBootstrap()` → `GET /bootstrap`
- `service.getHome()` → `GET /home`
- `properties.getOptions()` → `GET /properties/options`
- `locations.listProvinces()` → `GET /locations/provinces`
- `content.listLanguages()` → `GET /languages`
- `content.getLanguage()` → `GET /languages/{locale}`
- Browser session: `GET /api/session`

## Property Search

### Purpose

Let users find active properties through the complete, verified search and pagination contract.

### Intended Users

- Guest
- Authenticated client
- Property seeker

### Required Data

- Laravel-paginated `PropertySummary` results.
- Pagination `links` and `meta`, including current page, last page, page size, item range, and total.
- Backend property options for supported filter values.
- Province, district, and subdistrict options.
- Optional authenticated favorite state.

Each property summary can include:

- ULID `id`, `slug`, optional `property_code`, and `name`.
- Optional description.
- `property_type` and `listing_type`.
- Decimal-string sale, rent, and current prices plus currency.
- Optional bedrooms, bathrooms, nullable `size_sqm`, address, view count, and created date.
- Required location object, primary image URL, favorite state, and detail URL.

### Core UI Elements

- Search input mapped to `q`.
- Locale context mapped to `locale`.
- Listing type filter: `sale`, `rent`, or `both`.
- Property type filter using only returned/supported property types.
- Project status filter using only `under_construction`, `completed`, `units_available`, or `units_unavailable`.
- Province selector mapped to `p_code`.
- District selector mapped to `d_code`.
- Subdistrict selector mapped to `s_code`.
- Minimum and maximum price controls mapped to `min_price` and `max_price`.
- Minimum bedrooms and bathrooms controls.
- Facility selector mapped to repeated `facility_ids[]` query keys.
- Six supported quick filters: all residential, near school, budget, condominium, sustainable living, and pet friendly.
- Sort selector with only `newest`, `price_asc`, and `price_desc`.
- Active-filter summary and individual filter removal.
- Clear-all-filters action.
- Result total and current result range.
- Property summary collection.
- Pagination and page-size controls within the backend maximum.
- List/map navigation preserving compatible filters.
- Favorite action on each property.

There are no supported filters for floor area, land size, furnishing status, arbitrary radius, latitude/longitude, availability status, agent, or agency. Those controls must not be added to the search request.

### Primary Actions

- Apply or change search filters.
- Remove one active filter or clear all filters.
- Change sort order.
- Open a property detail page.
- Move between result pages.

### Secondary Actions

- Switch to property map mode.
- Save or remove a favorite after authentication.
- Change locale.

### Conditional Elements

- Disable or omit district selection until a province is selected.
- Disable or omit subdistrict selection until a district is selected.
- Changing province clears an incompatible district and subdistrict.
- Changing district clears an incompatible subdistrict.
- Preserve explicit `false` quick-filter values when they are intentionally sent; omit only absent values.
- Serialize each selected facility as its own `facility_ids[]` value.
- When a guest selects Favorite, request authentication and preserve the intended property action.
- Do not show Compare because comparison is unsupported.

### States

- Initial result loading.
- Filter-options loading.
- Dependent-location loading.
- Background result refresh while existing results remain usable.
- Pagination loading.
- Empty result set with filter-adjustment and clear-filter actions.
- Invalid location dependency or price range.
- End of results based on pagination metadata.
- Missing/inactive property after a result becomes stale.
- Favorite mutation pending, success, or failure.
- Authentication required or session expired.
- 422 validation, 429 rate limit with retry timing, network error, and server error.

### API Dependencies

- `properties.list(params)` → `GET /properties`
- `properties.getOptions(params)` → `GET /properties/options`
- `locations.listProvinces()` → `GET /locations/provinces`
- `locations.listDistricts(provinceCode)` → `GET /locations/provinces/{code}/districts`
- `locations.listSubdistricts(districtCode)` → `GET /locations/districts/{code}/subdistricts`
- `favorites.add(propertyId)` → BFF `PUT /api/favorites/{property}`
- `favorites.remove(propertyId)` → BFF `DELETE /api/favorites/{property}`

## Property Map

### Purpose

Let users explore the active property search geographically while retaining access to the equivalent non-map results.

### Intended Users

- Guest
- Authenticated client
- Property seeker

### Required Data

- Property markers returned for the current search filters and optional viewport bounds.
- Each marker's ULID, slug, name, latitude, longitude, nullable decimal-string price, currency, primary image URL, favorite state, and detail URL.
- Current property options and Thailand location hierarchy.
- Current map-provider runtime state, which is a frontend concern rather than API data.

### Core UI Elements

- Map-provider surface.
- Viewport-bound request behavior for `north`, `south`, `east`, and `west`.
- Property marker collection.
- Marker summary with property name, price when present, image, favorite action, and property-detail action.
- Current search filters and filter-editing access.
- Map/list toggle.
- Marker-result count and notice that the backend caps a response at 500 markers.
- Textual property-result access independent of map interaction.

### Primary Actions

- Pan or zoom and request markers for the new bounds.
- Open a marker's property.
- Refine filters when a result is too broad.
- Switch to the paginated list.

### Secondary Actions

- Save or remove a favorite after authentication.
- Return to the previous search context.

### Conditional Elements

- Use the same non-pagination filters as Property Search.
- Apply bounds only when sufficient map coordinates are available.
- If 500 markers are returned, explain that the result may be capped and offer narrower bounds or filters.
- A map-provider failure must not remove textual access to property results.
- Geolocation, if later enabled, is optional browser behavior and not required by the Laravel API.

### States

- Provider loading.
- Marker loading and request cancellation after rapid viewport changes.
- No markers in the current viewport.
- Capped marker result.
- Provider, tile, or client-credential failure.
- Location permission unavailable when optional geolocation is used.
- Favorite mutation pending or failed.
- Network, rate-limit, and server errors.

### API Dependencies

- `properties.getMap(params)` → `GET /properties/map`
- `properties.getOptions(params)` → `GET /properties/options`
- Location services used by Property Search.
- Favorite BFF routes for authenticated marker state changes.

## Property Detail

### Purpose

Give a property seeker the complete backend-supplied description of one active property and access to supported follow-up actions.

### Intended Users

- Guest
- Authenticated client
- Property seeker

### Required Data

- `PropertyDetail` for the requested slug and locale.
- All `PropertySummary` fields described on Property Search.
- Optional `detail` object, images, facilities, nearby locations, contacts, nested agents, project object, SEO object, related properties, and related articles.
- Current favorite state when authenticated.

Several nested detail, image, facility, nearby-location, contact, project, and SEO object shapes are underspecified in OpenAPI. Final field-level UI must narrow those values at runtime or wait for explicit schemas; it must not invent fields.

### Core UI Elements

- Property name and optional listing reference (`property_code`).
- Listing type and property type.
- Current/sale/rent price values when present, with currency.
- Location and optional address from returned data.
- Optional bedrooms, bathrooms, and floor size (`size_sqm`).
- Optional description.
- Primary image and returned image collection.
- Returned facilities and nearby locations.
- Returned project and SEO information when their structures are safely known.
- Nested agent summaries and contact records when returned.
- Property enquiry entry.
- Favorite action.
- Share action for the canonical property URL.
- Related properties and related articles when returned.
- Deduplicated view-recording behavior.

The contract does not define land area, video, virtual tour, agency information, viewing appointment actions, comparison actions, or public listing status. These must not be represented as guaranteed functionality.

### Primary Actions

- Submit a property enquiry.
- Save or remove the property from favorites after authentication.
- Follow a valid backend-provided contact value.
- Open a related active property.

### Secondary Actions

- Share the canonical property URL using browser capabilities.
- Open a related article.
- Return to search results while preserving the previous query.

### Conditional Elements

- Render only supplied optional fields and safely narrowed objects.
- Show current, sale, and rent prices according to non-null returned values; preserve decimal values as strings.
- Guests may submit enquiries and record views.
- Guests must authenticate before changing favorite state.
- If an agent summary is present, show only its returned identity, position, biography, experience, rating, image, email, phone, and safely understood contacts. Do not link to an unsupported agent detail page.
- A missing or inactive property produces a not-found/unavailable experience. Do not invent sold, rented, pending, draft, archived, or inactive detail states.

### States

- Initial loading and background revalidation.
- Complete detail.
- Partial detail with nullable or absent optional content.
- 404 missing or inactive property.
- Media item unavailable.
- View-recording failure that does not block reading.
- Favorite mutation pending, success, failure, or authentication required.
- Enquiry validation, submission, success, and failure states.
- Network, rate-limit, and server errors.

### API Dependencies

- `properties.getBySlug(slug, params)` → `GET /properties/{slug}`
- `properties.recordView(slug)` → BFF `POST /api/properties/{slug}/views`
- `properties.createEnquiry(slug, input)` → BFF `POST /api/properties/{slug}/enquiries`
- `favorites.add(propertyId)` → BFF `PUT /api/favorites/{property}`
- `favorites.remove(propertyId)` → BFF `DELETE /api/favorites/{property}`

## Property Enquiry

### Purpose

Allow a property seeker to send contact information and a message about the current property without requiring an account.

### Intended Users

- Guest
- Authenticated client
- Property seeker

### Required Data

- Current property slug and identifying summary.
- Optional nested agent identifier chosen from the property's returned agents.
- Request fields from `EnquiryInput`.

### Core UI Elements

| Field           | API field  | Requirement        | Functional validation and behavior                                                                      |
| --------------- | ---------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| Name            | `name`     | Required           | String, 3–120 characters. May be prefilled from an authenticated user but remains editable.             |
| Email           | `email`    | Required           | Valid email address. May be prefilled from the account.                                                 |
| Phone           | `phone`    | Required           | String up to 50 characters. The user model does not store a phone number, so it cannot be assumed.      |
| Message         | `message`  | Optional, nullable | Up to 2,000 characters.                                                                                 |
| Agent recipient | `agent_id` | Optional, nullable | Use only an ID returned in the current property's nested agents. Do not provide arbitrary agent search. |

Also required:

- Property context that makes the enquiry target clear.
- Submit action.
- Field-level Laravel validation messages and an accessible validation summary.
- Submission progress and duplicate-submit prevention.
- Success acknowledgement that does not imply an enquiry inbox or reply thread.

### Primary Actions

- Submit the enquiry.

### Secondary Actions

- Correct validation errors.
- Cancel or return to the property before submission.
- Use another backend-provided contact method when present.

### Conditional Elements

- Authentication is optional.
- Prefill name and email only when a current client session exists.
- Include `agent_id` only when the user selected a valid returned agent.
- Do not request preferred contact method, viewing date/time, or appointment details because the API does not support them.

### States

- Initial blank or prefilled form.
- Submitting and disabled duplicate submission.
- 422 field validation.
- Successful 201 creation.
- Property became inactive or unavailable.
- 429 rate limit with retry timing.
- Network or server failure with entered values retained.

### API Dependencies

- `properties.createEnquiry(slug, input)` → BFF `POST /api/properties/{slug}/enquiries`
- Optional session prefill: `GET /api/session`

## Article Index

### Purpose

Let users browse published PrimeProperty editorial content by tag and page.

### Intended Users

- Guest
- Authenticated client

### Required Data

- Laravel-paginated `ArticleSummary` results.
- Published article tags.
- Article fields: integer ID, slug, title, optional author, excerpt, nullable image, reading time, views, returned tags, nullable publication date, and detail URL.

### Core UI Elements

- Published article collection.
- Tag filter mapped to `tag`.
- Active tag and clear-filter action.
- Pagination and page-size controls.
- Result range and total from pagination metadata.
- Article title, excerpt, reading time, views, publication date, author, image, and tags when supplied.
- Article-detail action.

The API does not support free-text article search in v1, so no article search input should send an invented query.

### Primary Actions

- Open an article.
- Filter by one published tag.
- Move between pages.

### Secondary Actions

- Clear the active tag.
- Return to property discovery.

### Conditional Elements

- Omit optional author, image, date, or tags when absent.
- Use only tags returned by the article-tag endpoint.

### States

- Initial loading and background revalidation.
- Empty published collection.
- No results for a selected tag.
- Pagination loading and end of results.
- 422 invalid query, 429 rate limit, network error, and server error.

### API Dependencies

- `articles.list(params)` → `GET /articles`
- `articles.listTags()` → `GET /article-tags`

## Article Detail

### Purpose

Let users read one published article and continue to related editorial or property content.

### Intended Users

- Guest
- Authenticated client

### Required Data

- `ArticleDetail` for the slug.
- Article summary fields and required article `content`.
- Optional nested agent, popular readings, more articles, and suggested properties.

### Core UI Elements

- Title, content, excerpt, and available publication metadata.
- Optional main image, author, tags, reading time, and views.
- Optional nested agent summary without agent-profile navigation.
- Optional popular readings and more-article collections.
- Optional suggested property collection.
- Canonical URL share action.
- Deduplicated view recording.

### Primary Actions

- Read the article.
- Open another returned article or suggested property.

### Secondary Actions

- Share the article URL through browser capabilities.
- Return to the article index.

### Conditional Elements

- Render optional collections only when non-empty.
- Record a view after meaningful page access; a view-recording error must not prevent reading.
- Do not provide recently viewed articles because no retrieval API exists.

### States

- Loading and background revalidation.
- Published detail.
- Optional-content absence.
- 404 missing or inactive article.
- View-recording failure.
- Network, rate-limit, and server errors.

### API Dependencies

- `articles.getBySlug(slug)` → `GET /articles/{slug}`
- `articles.recordView(slug)` → BFF `POST /api/articles/{slug}/views`

## Privacy Policy

### Purpose

Present the current backend-managed privacy policy.

### Intended Users

- Everyone

### Required Data

- Legal content envelope returned by the privacy endpoint.

### Core UI Elements

- Returned legal title/content and any safely understood metadata.
- Navigation back to the previous supported destination.

### Primary Actions

- Read the privacy policy.

### Secondary Actions

- Navigate to Terms and Conditions.
- Return to the previous page.

### Conditional Elements

- Do not hardcode a competing policy when backend content exists.
- The legal envelope's data structure is not fully specific; render only known and safely narrowed content.

### States

- Loading.
- Content available.
- Content missing or structurally unsupported.
- Network or server error with retry access.

### API Dependencies

- `content.getPrivacyPolicy()` → `GET /legal/privacy-policy`

## Terms and Conditions

### Purpose

Present the current backend-managed terms and conditions.

### Intended Users

- Everyone

### Required Data

- Legal content envelope returned by the terms endpoint.

### Core UI Elements

- Returned legal title/content and any safely understood metadata.
- Navigation back to the previous supported destination.

### Primary Actions

- Read the terms and conditions.

### Secondary Actions

- Navigate to Privacy Policy.
- Return to the previous page.

### Conditional Elements

- Registration may link to this page but must not claim backend-recorded consent unless such a field is later added.
- Render only known legal-envelope content.

### States

- Loading.
- Content available.
- Content missing or structurally unsupported.
- Network or server error with retry access.

### API Dependencies

- `content.getTerms()` → `GET /legal/terms-and-conditions`

## AI Property Chat

### Purpose

Provide the backend-supported structured property conversation for guests and authenticated clients.

### Intended Users

- Guest
- Authenticated client
- Property seeker

### Required Data

- User `message`, maximum 2,000 characters.
- Optional conversation context containing at most ten `{ type, text }` turns.
- Turn `type` restricted to `user` or `assistant`; each `text` is at most 2,000 characters.
- Chat response type: `text`, `property`, `location`, `subdistrict`, or `agent`.
- Nullable response text and response items whose item schema is currently unspecified.

### Core UI Elements

- Message input.
- Send and cancel-current-request actions.
- Conversation history limited to the last ten turns sent upstream.
- Response text when returned.
- Safely narrowed structured result items.
- Clear-local-conversation action.
- Service status and retry information.

### Primary Actions

- Send a message.
- Continue the bounded conversation.
- Follow a safely recognized property or location action returned by the backend.

### Secondary Actions

- Cancel an in-flight request.
- Clear local conversation context.

### Conditional Elements

- Authentication is optional.
- Ignore or present a safe unsupported-content message for unrecognized `items`; never fabricate property, agent, or location fields.
- An `agent` response can contain only safely narrowed nested data and cannot link to a standalone agent page.
- Local chat history is not an account history because no persistence/listing endpoint exists.

### States

- Initial empty conversation.
- Sending.
- Request cancelled.
- Text response.
- Structured response with known items.
- Empty or unknown structured items.
- 422 invalid message/conversation.
- 429 rate limit with retry timing.
- 503 temporary chat unavailability preserved distinctly.
- Network or other server error.

### API Dependencies

- `content.chat(input)` → BFF `POST /api/chat`

## Authentication

## Login

### Purpose

Create a 30-day device-scoped Sanctum session without exposing the personal access token to browser JavaScript.

### Intended Users

- Guest
- Returning registered client

### Required Data

- Email.
- Password.
- Required device name, maximum 120 characters, derived by the frontend from the current client context.
- Returned user, expiry, device name, and optional verification-required status after the BFF strips `access_token`.

### Core UI Elements

- Email input.
- Password input.
- Password visibility action.
- Login action.
- Google login action.
- Forgot-password navigation.
- Registration navigation.
- Field-level validation and authentication error summary.
- Submitting state.

There is no `remember_me` request field. The API token already has a backend-provided 30-day expiry, so no remember-me control should alter persistence.

### Primary Actions

- Log in with email and password.
- Log in through Google token exchange.

### Secondary Actions

- Open Forgot Password.
- Open Register.
- Return to the public destination.

### Conditional Elements

- Preserve a safe intended destination or favorite intent through successful authentication.
- If `verification_required` is true or `user.email_verified` is false, offer Email Verification.
- Google login sends Google's `access_token` plus `device_name`, matching the current OpenAPI contract.
- The Laravel `access_token` is stored only in a Secure, HttpOnly, SameSite=Lax cookie and removed from browser-visible JSON.

### States

- Initial.
- Submitting with duplicate action disabled.
- Successful authenticated session.
- Invalid credentials.
- 422 field validation.
- Google provider or token-exchange error.
- Rate limited.
- Network/server error.
- Authenticated but email verification required.

### API Dependencies

- `auth.login(input)` → BFF `POST /api/auth/login`
- `auth.googleLogin(input)` → BFF `POST /api/auth/google`
- Safe session verification: `GET /api/session`

## Register

### Purpose

Create a client account and its initial device-scoped session.

### Intended Users

- Guest
- New property seeker

### Required Data

| Field            | API field               | Requirement | Functional validation and behavior                                 |
| ---------------- | ----------------------- | ----------- | ------------------------------------------------------------------ |
| Name             | `name`                  | Required    | String up to 255 characters.                                       |
| Email            | `email`                 | Required    | Valid email address.                                               |
| Password         | `password`              | Required    | Password input; Laravel remains the final password-rule authority. |
| Confirm password | `password_confirmation` | Required    | Must match `password` for immediate UX validation.                 |
| Device name      | `device_name`           | Required    | Derived client identifier, up to 120 characters.                   |

### Core UI Elements

- Inputs for all required fields.
- Password visibility actions.
- Register action.
- Login navigation.
- Links to legal documents where product policy requires disclosure.
- Field validation, submission status, and error summary.

### Primary Actions

- Create the account.

### Secondary Actions

- Open Login.
- Read Privacy Policy or Terms and Conditions.

### Conditional Elements

- Do not submit legal-consent or marketing-consent fields because registration does not support them.
- On success, use the BFF-created HttpOnly session.
- Offer Email Verification when required by the returned auth state.

### States

- Initial.
- Submitting.
- Successful account and session creation.
- Duplicate/invalid account data through 422 validation.
- Verification required.
- Rate limit, network error, and server error.

### API Dependencies

- `auth.register(input)` → BFF `POST /api/auth/register`
- `content.getPrivacyPolicy()` and `content.getTerms()` for linked legal content.

## Forgot Password

### Purpose

Request the backend password-reset process for an email address.

### Intended Users

- Guest
- Registered client who cannot log in

### Required Data

- Required valid `email`.

### Core UI Elements

- Email input.
- Submit reset request action.
- Login navigation.
- Validation and accepted-request feedback.

### Primary Actions

- Request password-reset instructions.

### Secondary Actions

- Return to Login.

### Conditional Elements

- Treat the 202 response as an accepted request and avoid revealing account existence beyond the backend message.

### States

- Initial.
- Submitting.
- Request accepted.
- 422 validation.
- Rate limit, network error, and server error.

### API Dependencies

- `auth.forgotPassword(input)` → BFF `POST /api/auth/forgot-password`

## Reset Password

### Purpose

Set a new password using a reset token and require a fresh login afterward.

### Intended Users

- Guest arriving from the password-reset flow

### Required Data

- Reset `token`.
- Account `email`.
- New `password`.
- `password_confirmation`.

### Core UI Elements

- Email context/input.
- New-password and confirmation inputs.
- Password visibility actions.
- Reset-password action.
- Invalid/expired-token feedback.
- Login navigation after success.

### Primary Actions

- Reset the password.

### Secondary Actions

- Request a new reset through Forgot Password.
- Open Login.

### Conditional Elements

- Validate password confirmation before submission.
- Do not create a session after reset; the OpenAPI response explicitly requires a fresh login.

### States

- Initial token context.
- Submitting.
- Successful reset with login required.
- Missing, invalid, or expired token.
- 422 field validation.
- Rate limit, network error, and server error.

### API Dependencies

- `auth.resetPassword(input)` → BFF `POST /api/auth/reset-password`

## Email Verification

### Purpose

Verify an authenticated client's email using a six-digit code and allow a replacement code to be requested.

### Intended Users

- Authenticated unverified client

### Required Data

- Current safe session and `user.email_verified` state.
- Required verification `code` matching exactly six digits.

### Core UI Elements

- Account email context.
- Six-digit code input.
- Verify action.
- Resend-code action.
- Verification and resend status.
- Logout action if the user cannot complete verification.

### Primary Actions

- Verify email.
- Resend verification code.

### Secondary Actions

- Return to the intended destination after success.
- Log out.

### Conditional Elements

- This page requires a valid authenticated cookie.
- Do not show the form when `email_verified` is already true.
- Respect resend rate-limit/retry timing.

### States

- Loading current verification status.
- Initial unverified.
- Verifying.
- Verified success.
- Invalid/expired six-digit code through 422 validation.
- Resend pending, accepted, or rate limited.
- Session expired/401, network error, and server error.

### API Dependencies

- `auth.verifyEmail(input)` → BFF `POST /api/auth/email/verify`
- `auth.resendVerification()` → BFF `POST /api/auth/email/resend`
- `profile.get()` / safe BFF session for current verification state.

## Authenticated user account

## Profile and Account Settings

### Purpose

Let the authenticated client inspect and update the account fields, avatar, verification state, and supported token lifecycle actions.

### Intended Users

- Authenticated client

### Required Data

- User integer ID, name, email, `email_verified`, nullable verification date, nullable avatar URL, and nullable creation date.
- Safe session expiry and device name from the BFF cookie metadata.

### Core UI Elements

- Current name and editable name.
- Current email and editable email.
- Email verification status and verification/resend entry when unverified.
- Current avatar or meaningful fallback.
- Avatar upload and remove actions.
- Session device name and expiry.
- Save-profile action.
- Logout current device action.
- Logout all devices action.

The user model has no phone, preferred contact method, address, biography, notification preferences, password-change endpoint, or account-deletion endpoint. Those fields/actions must not appear as supported account settings.

### Primary Actions

- Update name and/or email.
- Upload or remove avatar.
- Log out the current device.

### Secondary Actions

- Verify email or resend a code.
- Log out all devices.
- Open Favorites or Newsletter Settings.

### Conditional Elements

- Profile PATCH must contain at least one of `name` or `email`.
- Name is 2–255 characters; email must be valid.
- Avatar must be an image no larger than 2 MB and 5000×5000 pixels.
- Show avatar removal only when an avatar exists.
- Request confirmation before avatar removal and all-device logout.
- A changed email may affect verification state; use the returned `User` as authority.
- Any authenticated upstream 401 clears the frontend session cookie.

### States

- Authentication check/loading.
- Profile loading.
- View and edit states.
- Saving profile.
- 422 name/email validation.
- Avatar selection, validation, uploading, success, and failure.
- Avatar removal pending and success.
- Verified or unverified.
- Session approaching expiry or expired.
- Current-device logout and all-device logout pending/success/failure.
- Network, rate-limit, and server errors.

### API Dependencies

- `profile.get()` → BFF `GET /api/me`
- `profile.update(input)` → BFF `PATCH /api/me`
- `profile.uploadAvatar(file)` → BFF `POST /api/me/avatar`
- `profile.deleteAvatar()` → BFF `DELETE /api/me/avatar`
- `auth.logoutCurrentDevice()` → BFF `DELETE /api/auth/token`
- `auth.logoutAllDevices()` → BFF `DELETE /api/auth/tokens`
- Safe session: `GET /api/session`
- Verification routes listed under Email Verification.

## Favorites

### Purpose

Let an authenticated client browse and maintain saved active properties.

### Intended Users

- Authenticated client
- Property seeker

### Required Data

- Laravel-paginated property summary collection from Favorites.
- Current property favorite state and ULID.
- Pagination links and metadata.

### Core UI Elements

- Saved property collection using the same supported property-summary information as search.
- Open-property action.
- Remove-favorite action.
- Pagination and result range.
- Empty-favorites guidance with access back to Property Search.

### Primary Actions

- Open a saved property.
- Remove a property from favorites.

### Secondary Actions

- Continue property discovery.
- Re-add a favorite from another supported property context.

### Conditional Elements

- Authentication is required.
- Favorite add is idempotent `PUT`; removal is `DELETE`.
- Favorite state is private and must use no-store requests.
- If a previously saved property is no longer active, handle its absence without inventing sold/rented/archived status.
- Favorite removal is immediately reversible from other property contexts; a blocking confirmation is optional rather than mandatory.

### States

- Authentication loading or required.
- Favorites loading.
- Empty collection.
- Paginated collection.
- Pagination loading and end of results.
- Remove pending, success, or failure.
- Property unavailable/not found.
- Session expired, rate limited, network error, or server error.

### API Dependencies

- `favorites.list(params)` → BFF `GET /api/favorites`
- `favorites.add(propertyId)` → BFF `PUT /api/favorites/{property}`
- `favorites.remove(propertyId)` → BFF `DELETE /api/favorites/{property}`

## Newsletter Settings

### Purpose

Let an authenticated client inspect, update, or remove the newsletter subscription associated with the account email.

### Intended Users

- Authenticated client

### Required Data

- Current authenticated user's email.
- Current subscription envelope.
- Mutation response for update or removal.

The subscription data envelopes remain structurally unspecified in OpenAPI, so exact status/date fields cannot be assumed.

### Core UI Elements

- Account email context.
- Current subscription state after safe runtime narrowing.
- Enable/update subscription action.
- Remove subscription action.
- Confirmation for removal.

### Primary Actions

- Create or update the account-email subscription.
- Remove the subscription.

### Secondary Actions

- Return to Profile and Account Settings.

### Conditional Elements

- Authentication is required.
- The `PUT` request requires an `email`; prefill it from the authenticated user and do not present this as a guest arbitrary-email signup.
- Do not render unknown subscription metadata until the backend schema specifies it or runtime validation safely narrows it.

### States

- Authentication/profile loading.
- Subscription loading.
- Safely identified subscribed or not-subscribed state.
- Update pending and success.
- Removal confirmation, pending, and success.
- 422 validation.
- Session expired, rate limited, network error, and server error.

### API Dependencies

- `newsletter.get()` → BFF `GET /api/newsletter-subscription`
- `newsletter.update({ email })` → BFF `PUT /api/newsletter-subscription`
- `newsletter.remove()` → BFF `DELETE /api/newsletter-subscription`
- Current user: `GET /api/session` or `GET /api/me`

## Navigation requirements

Navigation describes destinations and behavior only. It must respect backend-provided navigation configuration after its object shape is safely narrowed.

### Public navigation

- Home.
- Properties, with Buy and Rent entries implemented as Property Search query states.
- Property Map where enabled by product navigation.
- Articles.
- AI Property Chat.
- Privacy Policy.
- Terms and Conditions.
- Language selection.
- Login and Register.

### Authenticated navigation

- All public destinations.
- Profile and Account Settings.
- Favorites.
- Newsletter Settings.
- Email Verification when required.
- Logout current device.

Do not expose standalone Agents, Agencies, Compare, My Properties, Inquiries, Appointments, Notifications, transaction areas, owner areas, or staff destinations.

### Navigation behavior

- Preserve supported property search state when moving between list and map.
- Preserve a safe intended destination when authentication is requested for Favorites.
- Update accessible document language when locale changes.
- Replace authenticated destinations with Login/Register after session expiry.
- Do not render arbitrary bootstrap navigation objects until their destination and permission fields are safely validated.

## Shared functional components

These names describe behavior, not appearance.

| Functional component       | Purpose and required data                                                                    | Main actions and reuse                                                                                                              | States and authentication                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ApplicationNavigation`    | Expose supported destinations from bootstrap configuration, active locale, and safe session. | Navigate, change locale, enter auth/account. Reused application-wide.                                                               | Bootstrap/session loading and errors; guest/authenticated variants.                            |
| `LanguageSelector`         | Use discovered locales and translation dictionaries.                                         | Change locale while preserving compatible route context.                                                                            | Loading, unsupported locale, dictionary fallback; public.                                      |
| `PropertySearch`           | Build the verified `PropertySearchParams`.                                                   | Submit text, listing type, property type, and location; used on Home and Search.                                                    | Options/location loading, invalid dependency, API error; public.                               |
| `PropertyFilters`          | Edit every supported detailed property filter and active-filter state.                       | Apply, remove one, clear all; used on Search and Map.                                                                               | Option loading, invalid values, refresh; public.                                               |
| `ThailandLocationSelector` | Select `p_code`, `d_code`, and `s_code` from location endpoints.                             | Load dependents and clear incompatible descendants; used in property search/filter contexts.                                        | Initial/loading/empty/error for each level; public.                                            |
| `PropertySummary`          | Present only the contract's property-summary fields.                                         | Open detail, favorite, optionally navigate to map context; used on Home, Search, Favorites, Article Detail, and related properties. | Optional-field absence, unavailable detail, favorite pending; favorite mutation requires auth. |
| `PropertyCollection`       | Present a collection plus result/pagination context.                                         | Open item and paginate; reused across search, home sections, favorites, and suggested properties.                                   | Loading, empty, error, end of results; auth follows its source.                                |
| `PropertyMapResults`       | Coordinate map markers, bounds, textual access, and the 500-marker cap.                      | Change viewport, open marker, switch to list.                                                                                       | Provider/marker loading, empty, capped, provider/API error; public.                            |
| `Pagination`               | Use exact Laravel links/meta without guessing pages.                                         | Previous, next, or supported page selection.                                                                                        | First/last page, loading, empty collection; public or authenticated according to source.       |
| `FavoriteAction`           | Set idempotent favorite state for a property ULID.                                           | Add or remove. Used on Search, Map, Detail, Favorites, and reusable summaries.                                                      | Unknown/pending/success/error/session expired; authenticated mutation only.                    |
| `ShareAction`              | Share a canonical property or article URL using browser capabilities.                        | Invoke supported share/copy behavior.                                                                                               | Browser share available/unavailable and copy failure; public, no API.                          |
| `AgentSummary`             | Present only nested `Agent` fields returned inside Home, Property Detail, or Article Detail. | Use valid contact values.                                                                                                           | Missing optional fields or invalid contact object; public, no standalone navigation.           |
| `EnquiryForm`              | Collect exact `EnquiryInput` fields for one property.                                        | Submit and correct errors; used on Property Detail.                                                                                 | Initial/submitting/422/success/rate limit/network error; public.                               |
| `ArticleSummary`           | Present contract article-summary fields.                                                     | Open article; reused on Article Index, Article Detail recommendations, and Property Detail related content.                         | Optional metadata absence, unavailable detail; public.                                         |
| `ProfileForm`              | Edit `name` and/or `email`.                                                                  | Save changes and resolve field errors.                                                                                              | Loading/editing/saving/422/success/session expired; authenticated.                             |
| `AvatarControl`            | Upload a valid avatar or remove the current avatar.                                          | Select, validate, upload, confirm removal.                                                                                          | No avatar, upload/removal pending, 422, success/error; authenticated.                          |
| `NewsletterControl`        | Manage account-email newsletter subscription.                                                | Update or confirm removal.                                                                                                          | Loading, safely narrowed state, pending, unknown envelope, error; authenticated.               |
| `AIPropertyChat`           | Manage a message, up to ten turns, and safe response narrowing.                              | Send, cancel, clear local context, follow recognized result.                                                                        | Idle/sending/cancelled/response/422/429/503/error; public with optional auth.                  |
| `LoadingState`             | Communicate pending data or mutation without hiding unrelated navigation.                    | Cancel when supported.                                                                                                              | Uses accessible status semantics.                                                              |
| `EmptyState`               | Explain a genuinely empty collection and provide a valid next action.                        | Clear filters, search, or navigate as context permits.                                                                              | Must not substitute mock content.                                                              |
| `ErrorState`               | Present safe API error messages and retry behavior.                                          | Retry, authenticate, or navigate to a valid context.                                                                                | Distinguishes 401, 403, 404, 422, 429, 500+, network, and cancellation.                        |
| `ConfirmationDialog`       | Confirm important supported destructive actions.                                             | Confirm or cancel and restore focus.                                                                                                | Used for avatar removal, newsletter removal, and all-device logout.                            |

No `CompareAction`, `AgencySummary`, `ViewingAppointmentForm`, property editor, property-media manager, or owner-listing component should be created until corresponding APIs exist.

## Thailand location selection

The supported hierarchy is:

```text
Province (`p_code`)
└── District (`d_code`, requires Province)
    └── Subdistrict (`s_code`, requires District)
```

Each location result has required `code` and `name`, optional `province_code` and `district_code`, and nullable `postal_code`.

Functional rules:

- Load provinces independently.
- Load districts only for the selected province code.
- Load subdistricts only for the selected district code.
- Changing Province clears District and Subdistrict before loading compatible districts.
- Changing District clears Subdistrict before loading compatible subdistricts.
- Empty child results are valid and must not be replaced with fake locations.
- Prevent a request state where district exists without province or subdistrict exists without district.
- Postal code may be displayed when returned, but it is not a property-search query field.
- Address, latitude, longitude, map position, and nearby landmarks are not user-editable location fields because listing creation/editing is unsupported.

API dependencies:

- `locations.listProvinces()`
- `locations.listDistricts(provinceCode)`
- `locations.listSubdistricts(districtCode)`

## User permissions

Only API-exposed user states are represented.

| Capability                                | Guest           | Authenticated client |
| ----------------------------------------- | --------------- | -------------------- |
| Browse active properties                  | Yes             | Yes                  |
| View active property detail               | Yes             | Yes                  |
| Use property map                          | Yes             | Yes                  |
| Read articles and legal content           | Yes             | Yes                  |
| Submit property enquiry                   | Yes             | Yes                  |
| Record deduplicated property/article view | Yes             | Yes                  |
| Use AI property chat                      | Yes             | Yes                  |
| Save/remove favorite                      | Login required  | Yes                  |
| View favorites                            | Login required  | Yes                  |
| View/update profile                       | Login required  | Yes                  |
| Upload/remove avatar                      | Login required  | Yes                  |
| Verify email/resend code                  | Login required  | Yes, when unverified |
| Manage newsletter subscription            | Login required  | Yes                  |
| Logout current/all devices                | Not applicable  | Yes                  |
| Compare properties persistently           | No API          | No API               |
| View enquiry history or replies           | No API          | No API               |
| Request/manage viewing appointments       | No API          | No API               |
| Create or manage listings                 | No API          | No API               |
| Use owner or agent role capabilities      | No role exposed | No role exposed      |

## Responsive functional requirements

- Every primary and secondary action remains reachable at every supported viewport size.
- All property filters remain available. They may be accessed through a dedicated filter control when simultaneous visibility is impractical.
- Applied filters and a clear-filter action remain discoverable after the detailed controls are closed.
- Property list/map switching preserves search state at every viewport size.
- A textual path to map properties remains available; map interaction cannot be the only way to select a property.
- Enquiry, authentication, profile, avatar, newsletter, favorite, chat, legal, and pagination controls remain keyboard-accessible and do not disappear solely because of viewport size.
- Loading, error, empty, and success feedback remains adjacent in function to the action or content it describes.
- No functionality may depend solely on hover.

## Accessibility requirements

- Every input has a persistent accessible label and appropriate input purpose/autocomplete metadata.
- Buttons and links have meaningful names; icon-only Favorite, Share, password visibility, map, close, and remove actions expose explicit accessible labels and state.
- Forms support keyboard submission and do not trap keyboard focus.
- Validation errors are programmatically associated with their fields, and multi-field errors have a focusable summary.
- Loading, disabled, success, and failure states are communicated to assistive technology without unnecessary focus changes.
- Dialogs set initial focus, contain focus while open, close by supported keyboard action, and restore focus to the triggering control.
- Property and article images use meaningful alternative text when informative; decorative or unavailable images do not repeat irrelevant file names.
- Pagination communicates the current page and unavailable previous/next actions.
- Favorite state communicates saved/not-saved in both name and state, not through appearance alone.
- Map markers have equivalent textual property links and do not require pointer precision.
- Locale changes update the document language.
- Request cancellation is not presented as an application error.

## Common system states

| State                    | Functional requirement                                                                             | Functionality that remains available                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Initial                  | Show the page purpose and stable controls that do not require data.                                | Navigation, legal destinations, and safe cancellation/back actions.               |
| Loading                  | Identify the resource or mutation in progress; prevent only conflicting duplicate actions.         | Existing data, cancellation where supported, and unrelated navigation.            |
| Empty                    | State what collection is empty and why when known. Never insert mock results.                      | Clear filters, broaden search, or navigate to the relevant supported entry point. |
| Validation Error         | Show Laravel field messages and a summary; retain entered values.                                  | Field correction and resubmission.                                                |
| Network Error            | Explain that the API was unreachable without exposing internals.                                   | Retry, preserve form/search state, and unrelated cached navigation/content.       |
| Server Error             | Preserve the upstream status category and safe message.                                            | Retry when appropriate and navigate elsewhere.                                    |
| Authentication Required  | Explain which protected action needs login and preserve a safe intended destination.               | Login, Register, public browsing, enquiry, and chat.                              |
| Session Expired          | Clear private client state after the BFF clears its cookie.                                        | Login again and continue public access.                                           |
| Permission Restricted    | Use only for an actual 403; do not infer owner/agent permissions.                                  | Return to a permitted destination.                                                |
| Not Found                | Distinguish a missing/inactive property or article from a network error.                           | Return to search/article index or retry a changed URL.                            |
| Rate Limited             | Preserve `Retry-After`, prevent premature repeat submission, and disclose when retry is available. | Read existing content and navigate elsewhere.                                     |
| Property Unavailable     | Treat inactive/missing property as 404; do not label it sold, rented, archived, or pending.        | Return to results and inspect other active properties.                            |
| Submission Success       | Confirm the completed supported operation once and prevent accidental duplicate submission.        | Continue in context, close the form, or navigate to a valid destination.          |
| Request Cancelled        | End pending feedback without showing a failure message.                                            | Adjust filters/message or start a new request.                                    |
| Partial Optional Content | Omit absent nullable/optional sections without inventing replacements.                             | All actions supported by the content that is present.                             |

## Confirmation actions

Confirmation is required for:

- Remove the current avatar.
- Remove the newsletter subscription.
- Logout all devices, because it invalidates every Sanctum token for the user.

Confirmation is context-dependent for:

- Remove Favorite. It is idempotent and reversible, so immediate removal with clear feedback may be preferable to a blocking confirmation.
- Logout current device. The action is expected and recoverable through login; a confirmation may be omitted when its label and outcome are explicit.
- Clear local AI conversation. Confirm only if the local history is meaningful and cannot be restored.

No confirmations are defined for comparison removal, property deletion/archive, appointment cancellation, media deletion, or account deletion because those capabilities do not exist in the API.

## API traceability

All 40 OpenAPI operations have typed service wrappers. Browser-accessible private data and mutations use same-origin BFF routes so the Sanctum token remains HttpOnly.

| Frontend service method        | Upstream endpoint                              | User-facing usage                                             |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------- |
| `service.discover()`           | `GET /`                                        | Service discovery and shell readiness.                        |
| `service.getBootstrap()`       | `GET /bootstrap`                               | Application shell, locales, feature/navigation configuration. |
| `service.getHome()`            | `GET /home`                                    | Home discovery content.                                       |
| `properties.list()`            | `GET /properties`                              | Property Search and reusable collections.                     |
| `properties.getOptions()`      | `GET /properties/options`                      | Search/filter options.                                        |
| `properties.getMap()`          | `GET /properties/map`                          | Property Map markers.                                         |
| `properties.getBySlug()`       | `GET /properties/{slug}`                       | Property Detail.                                              |
| `properties.recordView()`      | `POST /properties/{slug}/views`                | Deduplicated property view recording through BFF.             |
| `properties.createEnquiry()`   | `POST /properties/{slug}/enquiries`            | Property Enquiry through BFF.                                 |
| `locations.listProvinces()`    | `GET /locations/provinces`                     | Thailand Province selector.                                   |
| `locations.listDistricts()`    | `GET /locations/provinces/{code}/districts`    | Dependent District selector.                                  |
| `locations.listSubdistricts()` | `GET /locations/districts/{code}/subdistricts` | Dependent Subdistrict selector.                               |
| `articles.list()`              | `GET /articles`                                | Article Index.                                                |
| `articles.getBySlug()`         | `GET /articles/{slug}`                         | Article Detail.                                               |
| `articles.listTags()`          | `GET /article-tags`                            | Article tag filter.                                           |
| `articles.recordView()`        | `POST /articles/{slug}/views`                  | Deduplicated article view recording through BFF.              |
| `content.getPrivacyPolicy()`   | `GET /legal/privacy-policy`                    | Privacy Policy.                                               |
| `content.getTerms()`           | `GET /legal/terms-and-conditions`              | Terms and Conditions.                                         |
| `content.listLanguages()`      | `GET /languages`                               | Language discovery.                                           |
| `content.getLanguage()`        | `GET /languages/{locale}`                      | Translation dictionary.                                       |
| `content.chat()`               | `POST /chat`                                   | AI Property Chat through BFF.                                 |
| `auth.register()`              | `POST /auth/register`                          | Register through BFF.                                         |
| `auth.login()`                 | `POST /auth/login`                             | Login through BFF.                                            |
| `auth.googleLogin()`           | `POST /auth/google`                            | Google Login through BFF.                                     |
| `auth.forgotPassword()`        | `POST /auth/forgot-password`                   | Forgot Password through BFF.                                  |
| `auth.resetPassword()`         | `POST /auth/reset-password`                    | Reset Password through BFF.                                   |
| `auth.verifyEmail()`           | `POST /auth/email/verify`                      | Email Verification through BFF.                               |
| `auth.resendVerification()`    | `POST /auth/email/resend`                      | Resend verification code through BFF.                         |
| `auth.logoutCurrentDevice()`   | `DELETE /auth/token`                           | Logout current device through BFF.                            |
| `auth.logoutAllDevices()`      | `DELETE /auth/tokens`                          | Logout all devices through BFF.                               |
| `profile.get()`                | `GET /me`                                      | Profile/session data through BFF.                             |
| `profile.update()`             | `PATCH /me`                                    | Profile update through BFF.                                   |
| `profile.uploadAvatar()`       | `POST /me/avatar`                              | Avatar upload through BFF.                                    |
| `profile.deleteAvatar()`       | `DELETE /me/avatar`                            | Avatar removal through BFF.                                   |
| `favorites.list()`             | `GET /favorites`                               | Favorites page through BFF.                                   |
| `favorites.add()`              | `PUT /favorites/{property}`                    | Favorite action through BFF.                                  |
| `favorites.remove()`           | `DELETE /favorites/{property}`                 | Unfavorite action through BFF.                                |
| `newsletter.get()`             | `GET /newsletter-subscription`                 | Newsletter Settings through BFF.                              |
| `newsletter.update()`          | `PUT /newsletter-subscription`                 | Newsletter update through BFF.                                |
| `newsletter.remove()`          | `DELETE /newsletter-subscription`              | Newsletter removal through BFF.                               |

## Backend/API gaps affecting user UI

### Underspecified generic, home, legal, property, contact, and chat data

- **Expected user capability:** Reliably render all backend-curated home sections, property details, legal content, newsletter status, and structured chat results.
- **Missing or unclear API functionality:** `GenericDataEnvelope.data` and `ChatEnvelope.items` are unspecified. Several bootstrap/home/navigation/footer/testimonial, property detail/image/facility/nearby/contact/project/SEO, legal, newsletter, and agent-contact objects have only generic object schemas.
- **Affected pages:** Home, Property Detail, Privacy Policy, Terms and Conditions, Newsletter Settings, AI Property Chat, and application navigation.
- **Suggested backend change:** Add named OpenAPI schemas with required, optional, nullable, enum, identifier, and URL fields for each object and replace generic/empty schemas with those references.

### Standalone agent discovery and profiles

- **Expected user capability:** Browse agents, open a profile, inspect active listings, and contact a selected agent independently of a property.
- **Missing or unclear API functionality:** Agents exist only as nested summaries in home, property, and article responses. There is no agent list/detail endpoint, slug/detail URL, agent property endpoint, or exposed agent authentication role.
- **Affected pages:** Home and Property Detail can show nested summaries; Agent Listing and Agent Detail cannot be added to the page inventory.
- **Suggested backend change:** If standalone discovery is intended, add paginated `GET /agents`, `GET /agents/{slug}`, and an explicit active-property relationship with complete schemas and public URLs.

### Agency discovery and profiles

- **Expected user capability:** Browse agencies, inspect agency teams/listings, and contact an agency.
- **Missing or unclear API functionality:** No agency schema, list endpoint, detail endpoint, contact contract, team relationship, or agency-property relationship exists.
- **Affected pages:** Agency Listing and Agency Detail are excluded; agency information cannot be guaranteed on Property Detail.
- **Suggested backend change:** Add public agency list/detail endpoints and explicit team, contact, and active-listing schemas if this product area is required.

### Property comparison

- **Expected user capability:** Select properties and revisit a consistent comparison set.
- **Missing or unclear API functionality:** No comparison resource, persistence endpoints, comparison limit, or normalized comparison-detail contract exists.
- **Affected pages:** Property Search, Property Map, Property Detail, and a potential user Comparison page.
- **Suggested backend change:** If account-backed comparison is intended, define list/add/remove/clear endpoints and a comparison-ready property schema. If comparison is intentionally browser-local, document that product decision and maximum selection rules outside the API.

### Enquiry history and conversation

- **Expected user capability:** Review previously sent enquiries and any replies or status.
- **Missing or unclear API functionality:** The API only creates an enquiry. There is no authenticated enquiry list/detail, status enum, reply, close, or conversation endpoint.
- **Affected pages:** Property Enquiry can confirm submission, but Inquiries and Inquiry Detail pages are excluded.
- **Suggested backend change:** Add authenticated client-scoped enquiry list/detail endpoints with pagination, immutable property/recipient snapshots, status values, timestamps, and reply capabilities only if replies are part of the product workflow.

### Viewing appointments

- **Expected user capability:** Request, inspect, cancel, or reschedule a property viewing.
- **Missing or unclear API functionality:** No appointment request fields or list/detail/mutation endpoints exist.
- **Affected pages:** Property Detail and the potential Viewing Appointments account area.
- **Suggested backend change:** Add client-scoped appointment create/list/detail/cancel/reschedule operations with timezone-aware date/time, permitted transitions, contact snapshot, and property/recipient relationships if viewings are required.

### User-owned listing and media management

- **Expected user capability:** Create, edit, publish, archive, or remove the user's own listing and manage its images/video.
- **Missing or unclear API functionality:** There are no user listing CRUD endpoints, ownership/agent roles, listing status lifecycle, media upload/order/primary/remove endpoints, or user-listing enquiry/viewing APIs.
- **Affected pages:** My Properties, Create Property, Edit Property, Property Media, Property Inquiries, and Property Viewing Requests are excluded.
- **Suggested backend change:** Define user roles/abilities first, then add owner-scoped listing and media contracts with complete request validation, status transitions, authorization errors, and multipart behavior.

### Recently viewed retrieval

- **Expected user capability:** Revisit recently viewed properties or articles.
- **Missing or unclear API functionality:** The API records deduplicated views but exposes no current-user or anonymous recently-viewed collection.
- **Affected pages:** Home, Profile, and any potential Recently Viewed page.
- **Suggested backend change:** Add a privacy-reviewed, paginated recently-viewed endpoint and retention behavior if this feature is intended; otherwise keep view recording analytics-only.

### Profile security and account lifecycle

- **Expected user capability:** Change a password while authenticated or delete the account.
- **Missing or unclear API functionality:** Password reset exists only as an email-token flow. There is no authenticated password-change or account-deletion endpoint and no deletion/re-authentication contract.
- **Affected pages:** Profile and Account Settings.
- **Suggested backend change:** Add explicit authenticated password-change and account-deletion operations with current-password/re-authentication requirements only if these capabilities are intended.

### Notifications and transaction workflows

- **Expected user capability:** Receive account notifications or participate in payment, package, contract, or transaction workflows.
- **Missing or unclear API functionality:** No notification, payment, package, subscription billing, contract, or transaction endpoints exist. Newsletter subscription is the only supported subscription-like setting.
- **Affected pages:** No notification center, billing, package, contract, or transaction pages can be included.
- **Suggested backend change:** Define each product workflow and authorization boundary before adding versioned APIs; do not represent these capabilities with frontend-only placeholders.

### Map-provider contract

- **Expected user capability:** Reliably load map tiles and recover from provider or quota failure.
- **Missing or unclear API functionality:** The API returns coordinates and viewport markers but does not specify a map provider, client configuration, geocoding, clustering, usage limits, or provider failure behavior.
- **Affected pages:** Property Map and map-related parts of Property Detail.
- **Suggested backend change:** Provider selection may remain a frontend/deployment decision. If it must be centrally managed, expose only safe public map configuration and feature flags through a fully specified bootstrap schema; never expose server secrets.

## Final implementation boundary

Future UI implementation may build only the pages and functional components listed in this guide. Optional response data must remain optional, unknown response objects must be narrowed before use, Laravel remains the validation authority, and unsupported workflows must remain absent rather than being represented with mock services or inferred permissions.
