# API contract

**Status:** As-built reference for the REST API in `apps/api` (kept at this
path for existing links). Real-time events are documented in
[backend.md](./backend.md#62-events).

## Conventions

- **Base path:** `/api/v1` (also available as `/v1`). The frontend calls `/api/v1/...`.
- **Auth:** every route except the auth entry points and health checks requires `Authorization: Bearer <jwt>`. A missing token returns `401 { "message": "No token provided" }`; an invalid or expired token returns `403 { "message": "Invalid or expired token" }`. Sessions are JWTs — there are no cookies or refresh tokens.
- **Errors:** application errors use one envelope. (The auth middleware's `401`/`403` and a few controller guards return a plain `{ "message": ... }` instead.)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "requestId": "uuid",
    "details": {}
  }
}
```

- Every response carries an `x-request-id` header; callers may supply their own.
- Rate limit: 120 requests/minute per IP (`429 RATE_LIMITED`).

## 1. Product rules

1. An account cannot log in until its email is verified (Google sign-in accounts are verified automatically).
2. A profile is **complete** only when it has: full name (≥ 2 chars), age 18–100, gender, location, occupation, an "about" of at least 10 characters, one or more interests, **and a profile photo**. Incomplete profiles still appear in discovery.
3. A like is directed (`liker → liked`). Liking someone you already like is a harmless no-op.
4. A **match** is the mutual-like state. It is not stored — it is derived from two `Like` records.
5. **Messaging requires a match.** Both people must currently like each other; if either un-likes, message reads and writes are denied (`403 NOT_MATCHED`), and the socket join is refused. Message history is kept.
6. A conversation id is derived: the two user ids sorted and joined with `_` (`<idLow>_<idHigh>`).

## 2. Authentication — `/auth`

| Method | Path | Auth | Body | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | – | `{ fullName, email, password }` | Create an unverified account; emails a 6-digit code (10-minute expiry) |
| POST | `/auth/verify-email` | – | `{ email, code }` | Verify the account |
| POST | `/auth/resend-verification` | – | `{ email }` | Send a replacement code |
| POST | `/auth/login` | – | `{ email, password }` | Returns `{ token, user }` for a verified account |
| POST | `/auth/google` | – | `{ idToken }` | Verifies a Google ID token; finds, links, or creates the account; returns `{ token, user }` |
| GET | `/auth/me` | yes | – | Current user |
| POST | `/auth/forgot-password` | – | `{ email }` | Emails a reset code; the response never reveals whether the email exists |
| POST | `/auth/reset-password` | – | `{ email, token, newPassword, confirmPassword }` | Replace the password using the emailed code |
| POST | `/auth/change-password` | yes | `{ currentPassword, newPassword }` | Wrong current password → `400 INVALID_CURRENT_PASSWORD` (not 401, so the client doesn't treat it as an expired session); Google-only accounts → `400 NO_PASSWORD_SET` |
| DELETE | `/auth/account` | yes | – | Deletes the user, their profile, likes, and messages |

Successful auth responses use `{ "message": "...", "data": ..., "requestId": "..." }`. Login returns
`data: { token, user: { id, fullName, email, role, isEmailVerified } }`. Password hashes,
verification codes, and reset tokens are never returned. Input shapes are validated by the shared
zod schemas in `packages/shared/src/schemas/auth.ts`.

## 3. Profiles and discovery — `/profiles`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/profiles` | Paginated discovery (see below) |
| GET | `/profiles/me/profile` | The current user's profile → `{ "profile": Profile \| null }` (`null` for a brand-new user) |
| GET | `/profiles/:profileId` | A profile by **user id** → `{ "data": Profile \| null }` |
| POST | `/profiles/createProfile` | Create or update (upsert) the current user's profile. `multipart/form-data` with `fullName, age, gender, location, occupation, about, interests` (JSON array string) and an optional `profilePicture` file (JPEG/PNG, ≤ 5 MB, uploaded to Cloudinary). Returns `201 { success, message, profile }` |

**Discovery query parameters**

| Param | Meaning |
| --- | --- |
| `tab` | `all` (default), `new`, or `near-me` |
| `search` | Case-insensitive match against full name or interests |
| `page`, `pageSize` | 1-based page (default 1) and size (default 8, max 50) |
| `excludeUserId` | Hide this user (the caller's own profile) |
| `seed` | Integer shuffle key for `tab=all` — see below |
| `radius` | Kilometres, for `tab=near-me` only (default 50, clamped to 1–500) |

**Ordering by tab**

- `all` — a deterministic shuffle derived from `seed`. The client generates one seed per visit and sends it with every page request, so the order is random per visit but stable while paging (no repeats or skipped users). A different seed gives a different order.
- `new` — newest accounts first (`createdAt` descending).
- `near-me` — profiles within `radius` km of the caller's own `locationCoords` (a GeoJSON `[lng, lat]` point stored on the profile, from a `2dsphere` index), nearest first. Requires the caller to have coordinates (`400` otherwise). Each item carries a `distanceLabel` such as `"12 km away"` or `"In your area"`. `locationCoords` is hidden from every response except the caller's own profile.

**Location endpoints**

- `GET /api/v1/geocode/autocomplete?q=<text>` — authenticated, rate-limited (40/min/IP). Returns `{ "data": [{ "label": "Ikeja, Lagos", "lat": 6.59, "lng": 3.34 }], "provider": "locationiq" }` for Nigerian area-level places (cities, districts, LGAs, states). `provider` is `locationiq` or `photon` — the UI shows that provider's attribution. LocationIQ is primary when `LOCATIONIQ_API_KEY` is set and Photon is the fallback (or the only provider when no key is set); `502 GEOCODER_UNAVAILABLE` only if every provider fails. Results are cached in memory for an hour.
- `POST /api/v1/profiles/createProfile` now requires `locationCoords` (JSON string in the multipart body: `{"type":"Point","coordinates":[lng,lat]}`) alongside `location`.

**Response**

```json
{
  "success": true,
  "message": "Profiles listed",
  "data": {
    "message": "Profile discovery successful.",
    "status": "success",
    "items": [ { "id": "<userId>", "userId": "<userId>", "fullName": "...", "age": 25,
                 "gender": "female", "location": "Lagos", "occupation": "", "about": "...",
                 "interests": ["Music"], "interest": ["Music"], "profilePicture": null,
                 "isComplete": false, "joinedDaysAgo": 3 } ],
    "total": 19,
    "page": 1,
    "pageSize": 8
  }
}
```

`total` is the number of **profiles** matching the filters (excluding the caller). Users who
registered but never saved a profile have no profile document and therefore never appear in
discovery — so the user count can be higher than the discoverable count.

## 4. Likes and matches — `/likes`

| Method | Path | Purpose |
| --- | --- | --- |
| PUT | `/likes/profiles/:profileId/like` | Like a user. Returns `{ message, status, likerId, likedUserId, matched }` — `matched` is `true` when this like completed a match |
| DELETE | `/likes/profiles/:profileId/like` | Remove your like |
| GET | `/likes/liked-by-me` | `{ items: Profile[] }` — profiles you liked |
| GET | `/likes/who-liked-me` | `{ items: Profile[] }` — profiles that liked you |
| GET | `/likes/matches` | `{ items: Profile[] }` — mutual likes |

Side effects: a like that completes a match pushes a `new_match` socket event to the person who
liked first; a like that does not complete a match pushes `new_like` to the liked person. Both
pushes are best-effort and never fail the request.

## 5. Conversations — `/conversations`

All routes require auth and a valid match (see rule 5).

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/conversations` | `{ data: [{ matchId, otherUser, lastMessage, unreadCount }] }`, newest activity first |
| GET | `/conversations/:conversationId/messages` | `{ data: [{ id, matchId, senderId, text, sentAt }] }` in chronological order |
| POST | `/conversations/:conversationId/messages` | Body `{ content }` (or `text`); returns `201 { data: message }`. Empty text → `400 EMPTY_MESSAGE` |
| POST | `/conversations/:conversationId/read` | Marks the other person's messages as read by you |

The app normally sends messages over the socket (`send_message`) rather than the REST route.
`unreadCount` counts messages not sent by you whose `readBy` does not include you.

## 6. Preferences and health

| Method | Path | Status |
| --- | --- | --- |
| GET, PATCH | `/preferences/me/preferences` | **Not implemented** — returns `501 NOT_IMPLEMENTED`. The Settings page keeps "New matches" / "New messages" in the browser's `localStorage` instead |
| GET | `/health/live` | `{ "status": "alive" }` |
| GET | `/health/ready` | `{ "status": "ready", "checks": { ... } }` — dependency checks are placeholders (`not-configured`) |

`GET /health` (outside `/v1`) is a compatibility alias for a basic liveness check.

## 7. Client-side notification behavior

Not part of the API, but worth knowing when reading the frontend:

- **Toast / match popup** are gated by the "New messages" / "New matches" toggles in Settings.
- **The header bell** always records new matches, likes, and messages regardless of those toggles, and is held in memory only.
- **Unread badges and the "Typing…" indicator** in the conversation list are driven by `new_message_notification` and `user_typing` events and are not affected by the toggles.
