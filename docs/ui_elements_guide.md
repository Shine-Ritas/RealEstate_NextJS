# PrimeProperty functional UI elements guide

## Purpose and boundaries

This document defines the user-facing behavior supported by the implemented PrimeProperty frontend services. It is an implementation inventory, not a visual specification: it does not prescribe colors, typography, spacing, imagery, animation, layout composition, or component appearance.

The pinned OpenAPI contract is the wire-format authority. The supported roles are guest and authenticated client. The API does not expose owner, agent, staff, moderator, or administrator authorization roles.

## Shared rules

### Application shell and navigation

- **Purpose:** Provide persistent access to public discovery, search, map, articles, legal content, authentication, favorites, profile, newsletter settings, and AI chat.
- **Users:** Guests and authenticated clients.
- **Required API data:** `service.discover`, `service.getBootstrap`, `content.listLanguages`, and optionally `/api/session`.
- **Core elements:** Locale selection, property search entry, public navigation destinations, session-aware account entry, favorites entry, and a route-level status region.
- **Primary actions:** Change locale, start a search, open a supported destination, sign in, or open the current account.
- **Secondary actions:** Sign out the current device and access privacy or terms.
- **Conditional behavior:** Authenticated users see account/favorites access; guests see login/register access. Unsupported owner, agent, and admin destinations must not appear.
- **States:** Bootstrap loading, language unavailable, unauthenticated, authenticated, expired session, offline, and service error.
- **Dependencies:** `GET /`, `GET /bootstrap`, `GET /languages`, `GET /languages/{locale}`, and BFF `GET /api/session`.

### Shared system states

Every experience must account for loading, empty, success, validation, unauthorized, forbidden, not-found, rate-limited, server-unavailable, network, and cancelled-request states where relevant. A 401 should move the user to a signed-out state because the BFF clears the invalid cookie. A 429 should retain the retry delay. A chat 503 should remain a temporary service-unavailable state rather than becoming a generic validation failure.

Laravel 422 errors should be placed beside their matching field when possible, with the first validation message available for a summary. Optional content may be absent or null and should be omitted gracefully, not replaced with invented data.

### Accessibility and responsive functional access

- Every action must be keyboard operable and have an accessible name.
- Loading and mutation outcomes must be announced without unexpectedly moving focus.
- Form errors must be programmatically associated with fields and summarized when several fields fail.
- Dialogs and confirmations must trap and restore focus correctly when used.
- Search, filters, map/list switching, authentication, favorites, enquiry, chat, and account actions must remain reachable at every supported viewport size.
- Map-only information needs a non-map textual path so keyboard and screen-reader users can reach property results.
- Locale changes must update document language and preserve the user's current supported context where practical.

### Permissions and confirmations

- Guests may read public data, record deduplicated views, submit enquiries, and use AI chat. Favorites, profile, avatar, newsletter, verification, and logout operations require authentication.
- When a guest attempts a protected action, preserve the intended destination or property and request authentication.
- Confirm actions that remove an avatar, remove a newsletter subscription, or sign out all devices. Favorite removal is reversible and need not require a blocking confirmation.
- Never expose or display the Sanctum token. Device name and expiry may be shown as session metadata.

## Experiences

### 1. Home discovery

- **Purpose:** Present backend-curated entry points into active property inventory and editorial content.
- **Users:** Guests and authenticated clients.
- **Required API data:** Bootstrap and home envelopes for the active locale. Nested objects that OpenAPI leaves unspecified must be narrowed only after runtime inspection.
- **Core elements:** Search entry, backend-provided discovery groups, property links, article links, locale-aware labels, and optional content sections only when returned.
- **Primary actions:** Start a property search or open an active property.
- **Secondary actions:** Open an article or change locale.
- **Conditional behavior:** Authenticated requests may supplement property summaries with private favorite state using no-store data. Public home content remains anonymously cacheable.
- **States:** Loading, partial optional content, no curated content, stale/revalidating content, locale fallback, and service error.
- **Dependencies:** `service.getBootstrap` (`GET /bootstrap`), `service.getHome` (`GET /home`), and `content.getLanguage` (`GET /languages/{locale}`).

### 2. Property search and filter results

- **Purpose:** Discover active properties using the exact backend-supported search contract.
- **Users:** Guests and authenticated clients.
- **Required API data:** Paginated property summaries, property options, and Thailand address hierarchy.
- **Core elements:** Text search; listing type; property type; project status; province, district, and subdistrict; minimum/maximum price; minimum bedrooms/bathrooms; facilities; six quick filters; sort; page; page size; result count; and result links.
- **Primary actions:** Apply filters, clear filters, change sort, paginate, and open a property.
- **Secondary actions:** Switch to map mode and favorite a property after authentication.
- **Conditional behavior:** District selection is unavailable until a province is selected; subdistrict is unavailable until district is selected. Facilities use repeated `facility_ids[]`. Explicit false quick-filter values remain distinct from omitted filters. Changing an upstream location clears incompatible downstream selections.
- **States:** Initial loading, background refresh, empty result, invalid filter dependency, page not found, authenticated/guest favorite state, rate limit, and network/server errors.
- **Dependencies:** `properties.list` (`GET /properties`), `properties.getOptions` (`GET /properties/options`), `locations.listProvinces`, `locations.listDistricts`, `locations.listSubdistricts`, and authenticated favorites BFF routes.

Supported search fields are only: `locale`, `q`, `listing_type`, `property_type`, `project_status`, `p_code`, `d_code`, `s_code`, `min_price`, `max_price`, `min_bedrooms`, `min_bathrooms`, `facility_ids`, `quick_all_residential`, `quick_near_school`, `quick_budget`, `quick_condominium`, `quick_sustainable_living`, `quick_pet_friendly`, `sort`, `page`, and `per_page`.

### 3. Property map mode

- **Purpose:** Explore the same active property search geographically.
- **Users:** Guests and authenticated clients.
- **Required API data:** Property markers and current filter/options data.
- **Core elements:** Map viewport, marker count, textual result access, list/map switch, current filters, and viewport refresh behavior.
- **Primary actions:** Change viewport, request markers for `north`, `south`, `east`, and `west`, and open a marker's property.
- **Secondary actions:** Adjust filters or switch back to the paginated list.
- **Conditional behavior:** Preserve the non-pagination filters shared with search. The API caps responses at 500 markers; the experience must disclose truncation/cap behavior when relevant and invite a narrower viewport or filters.
- **States:** Loading markers, no markers, capped marker set, map-provider loading/failure, geolocation unavailable, backend error, and accessible textual alternative.
- **Dependencies:** `properties.getMap` (`GET /properties/map`) and property-options/location services.

The mapping provider, provider credentials, tile policy, clustering behavior, and provider-specific failures are frontend decisions; no provider contract exists in the API.

### 4. Property detail, enquiry, sharing, favorites, and related content

- **Purpose:** Explain one active property and let a prospective client take supported follow-up actions.
- **Users:** Guests and authenticated clients.
- **Required API data:** Property detail envelope for a slug and locale. OpenAPI-unspecified nested property/contact objects remain conditional until narrowed.
- **Core elements:** Returned property facts, price/size strings without numeric precision loss, location, media when supplied, facilities, nested agent/contact summary when supplied, related content when supplied, favorite status, enquiry fields, sharing action, and view recording.
- **Primary actions:** Submit an enquiry, favorite/unfavorite, and follow a backend-provided contact path.
- **Secondary actions:** Share the canonical property URL, inspect related content, and return to results.
- **Conditional behavior:** Enquiry requires `name`, `email`, and `phone`; `message` and `agent_id` are optional. Guests can enquire. Favorites require authentication. Record a deduplicated view without creating a recently viewed list. Render only fields present in the response.
- **States:** Loading, 404 for inactive or missing property, nullable/absent content, media unavailable, enquiry success, 422 enquiry errors, favorite mutation pending/failure, expired session, rate limit, and server error.
- **Dependencies:** `properties.getBySlug` (`GET /properties/{slug}`), `properties.recordView` (`POST /properties/{slug}/views`), `properties.createEnquiry` (`POST /properties/{slug}/enquiries`), `favorites.add`, and `favorites.remove`.

Sharing is a browser capability and has no API endpoint. Only active properties are visible. Do not create sold, rented, draft, pending, archived, owner-controlled, or agent-controlled listing states.

### 5. Article index

- **Purpose:** Browse public editorial content.
- **Users:** Guests and authenticated clients.
- **Required API data:** Paginated article summaries and article tags.
- **Core elements:** Article list, supported query/filter controls returned by the contract, tags, pagination, and article links.
- **Primary actions:** Open an article, select a tag/filter, search where supported, and paginate.
- **Secondary actions:** Clear filters and return to property discovery.
- **Conditional behavior:** Empty tags and optional summary content are valid. Preserve integer article identifiers and Laravel pagination.
- **States:** Loading, empty collection, no filtered matches, invalid page, rate limit, network, and server errors.
- **Dependencies:** `articles.list` (`GET /articles`) and `articles.listTags` (`GET /article-tags`).

### 6. Article detail

- **Purpose:** Read one public article and record a deduplicated view.
- **Users:** Guests and authenticated clients.
- **Required API data:** Article detail for a slug.
- **Core elements:** Returned title, content, metadata, tags/related content when supplied, share action, and navigation back to articles.
- **Primary actions:** Read and follow supported related links.
- **Secondary actions:** Share the canonical article URL.
- **Conditional behavior:** Record a view after meaningful access. Do not expose a recently viewed article list because no such API exists.
- **States:** Loading, 404 for missing/inactive article, absent optional content, record-view failure that does not block reading, and server/network errors.
- **Dependencies:** `articles.getBySlug` (`GET /articles/{slug}`) and `articles.recordView` (`POST /articles/{slug}/views`).

### 7. Privacy policy and terms

- **Purpose:** Present the current backend-managed legal documents.
- **Users:** Everyone.
- **Required API data:** Privacy policy or terms envelope.
- **Core elements:** Document title/content and effective/update metadata when returned.
- **Primary actions:** Read the document.
- **Secondary actions:** Return to the previous supported destination.
- **Conditional behavior:** Render only contract data; do not hardcode a competing legal document in the frontend.
- **States:** Loading, content unavailable, and service error.
- **Dependencies:** `content.getPrivacyPolicy` (`GET /legal/privacy-policy`) and `content.getTerms` (`GET /legal/terms-and-conditions`).

### 8. Login, registration, Google login, forgot/reset password, and verification

- **Purpose:** Establish and recover a device-scoped Sanctum session and complete email verification.
- **Users:** Guests for login/recovery; authenticated unverified clients for verification/resend.
- **Required API data:** Auth response user/token metadata, validation errors, verification-required state, and status envelopes.
- **Core elements:** Login fields; registration fields; Google identity token exchange; required `device_name`; forgot-password email; reset token/email/password fields; six-digit verification code; resend action; and legal acknowledgement where product policy requires it.
- **Primary actions:** Register, log in, continue with Google, request reset, reset password, verify email, or resend verification.
- **Secondary actions:** Move among supported auth flows and return to the intended protected destination.
- **Conditional behavior:** The HttpOnly BFF cookie receives the API expiry. Browser responses never contain `access_token`. Verification UI appears only when required. Repeated submits are disabled while pending.
- **States:** Pending, success, invalid credentials, duplicate registration data, 422 field errors, invalid/expired reset token, invalid verification code, resend cooldown/rate limit, Google exchange failure, network failure, and server error.
- **Dependencies:** BFF routes backed by `auth.register`, `auth.login`, `auth.googleLogin`, `auth.forgotPassword`, `auth.resetPassword`, `auth.verifyEmail`, and `auth.resendVerification`.

### 9. Profile, avatar, verification status, and token lifecycle

- **Purpose:** Let an authenticated client inspect and maintain the account represented by the API.
- **Users:** Authenticated clients.
- **Required API data:** Current user, safe session metadata, and profile/avatar mutation responses.
- **Core elements:** Name, email, avatar, email verification status, device name, token expiry, current-device logout, and all-device logout.
- **Primary actions:** Update name/email, upload or remove avatar, verify/resend when unverified, and sign out.
- **Secondary actions:** Sign out all devices and inspect expiry/device metadata.
- **Conditional behavior:** Profile update must include at least one of `name` or `email`. Avatar must be an image no larger than 2 MB; the backend also enforces maximum dimensions of 5000×5000. Confirm avatar removal and all-device logout. Any authenticated 401 clears the local session cookie.
- **States:** Loading, unauthenticated redirect, edit pending, 422 field errors, email now requiring verification, invalid avatar type/size/dimensions, upload progress where available, expiry approaching, session expired, and server error.
- **Dependencies:** `profile.get`, `profile.update`, `profile.uploadAvatar`, `profile.deleteAvatar`, `auth.logoutCurrentDevice`, `auth.logoutAllDevices`, and BFF `GET /api/session`.

### 10. Favorites

- **Purpose:** Maintain the authenticated client's saved active properties.
- **Users:** Authenticated clients; guests may initiate a favorite intent that leads to authentication.
- **Required API data:** Paginated favorites and idempotent favorite state responses.
- **Core elements:** Saved property list, pagination, property links, and remove actions.
- **Primary actions:** Open or remove a favorite.
- **Secondary actions:** Continue property search.
- **Conditional behavior:** Add uses idempotent PUT and remove uses DELETE with the property's ULID. If a saved property is no longer publicly active, handle its absence without inventing a listing state.
- **States:** Loading, empty collection, add/remove pending, expired session, 404 property absence, rate limit, and server/network errors.
- **Dependencies:** `favorites.list` (`GET /favorites`), `favorites.add` (`PUT /favorites/{property}`), and `favorites.remove` (`DELETE /favorites/{property}`).

### 11. Newsletter settings

- **Purpose:** Inspect, enable/update, or remove the newsletter subscription tied to the authenticated account email.
- **Users:** Authenticated clients only.
- **Required API data:** Current subscription state and mutation status.
- **Core elements:** Account email context, current subscription state, update action, and remove action.
- **Primary actions:** Enable/update the subscription or remove it.
- **Secondary actions:** Return to profile.
- **Conditional behavior:** The API uses the authenticated account email; do not provide an arbitrary-email subscription form for guests. Confirm removal.
- **States:** Loading, subscribed, not subscribed, update/remove pending, 422 validation, expired session, rate limit, and server error.
- **Dependencies:** `newsletter.get`, `newsletter.update`, and `newsletter.remove` on `/newsletter-subscription`.

### 12. AI property chat

- **Purpose:** Provide structured conversational assistance within the backend-supported property context.
- **Users:** Guests and authenticated clients.
- **Required API data:** Chat envelope response. `ChatEnvelope.items` remains structurally unspecified and must be runtime-narrowed before rendering.
- **Core elements:** Message input, up to ten prior `{type, text}` conversation turns, send/cancel action, response region, and clear-conversation action local to the browser session.
- **Primary actions:** Send a message and continue a bounded conversation.
- **Secondary actions:** Clear local context and follow only safely recognized response actions.
- **Conditional behavior:** Send `message` plus no more than ten conversation turns. Authentication is optional. Treat unknown response items defensively and ignore unrecognized structures rather than fabricating cards or links.
- **States:** Idle, sending, cancelled, response, 422 input error, 429 retry delay, preserved 503 temporary unavailability, malformed/unknown item, network failure, and empty optional content.
- **Dependencies:** `content.chat` (`POST /chat`) through the same-origin `/api/chat` BFF route.

### 13. Language discovery and translation dictionaries

- **Purpose:** Select a supported locale and load backend-provided translation dictionaries.
- **Users:** Everyone.
- **Required API data:** Supported languages and dictionary for `en`, `my`, `th`, or `zh` with any documented namespace/query option.
- **Core elements:** Locale selector and translated application strings.
- **Primary actions:** Change locale.
- **Secondary actions:** Recover to a supported default if a dictionary is unavailable.
- **Conditional behavior:** Preserve a compatible route/search context. Content fields remain in the response's wire format. Do not advertise a locale absent from language discovery.
- **States:** Loading, unsupported locale, missing dictionary key, fallback, and server/network error.
- **Dependencies:** `content.listLanguages` (`GET /languages`) and `content.getLanguage` (`GET /languages/{locale}`).

## Excluded user experiences

The following must remain absent until a backend contract explicitly supports them:

- Standalone agent pages; agents are nested summaries without list/detail endpoints.
- Agency and owner profiles.
- Property comparison persistence.
- Enquiry history, replies, inboxes, or CRM workflows.
- Property viewing appointments.
- User property creation/editing, media management, or listing lifecycle controls.
- Notifications.
- Payments, subscriptions/packages beyond the newsletter, contracts, or transactions.
- Recently viewed lists; only deduplicated property/article view recording exists.
- Sold, rented, draft, pending, archived, or other user-facing listing states; public inventory is active only.
- Owner, agent, admin, moderation, reporting, configuration, or staff functionality.
- Bot, Telegram, tag-search, legacy map-bound, and web-session authentication routes identified outside API v1.

## API gaps requiring future decisions

1. `GenericDataEnvelope.data`, `ChatEnvelope.items`, and several nested property/home/contact objects remain underspecified in OpenAPI. They are intentionally `unknown`; runtime schemas or a richer backend contract are required before final UI rendering.
2. No APIs exist for agent profiles, agencies, owner profiles, comparison persistence, enquiry history, appointments, listing management, notifications, or transaction workflows.
3. The API does not select a mapping provider or define provider credentials, geocoding, clustering, tile failures, or usage-limit behavior.
4. Sharing, local chat-history clearing, and map-provider recovery are frontend behaviors, not backend services.
5. Unsupported features are excluded from this inventory. Future UI work must not represent them with fake data, placeholder services, or inferred permissions.
