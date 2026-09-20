# Fixes and lessons

**Last updated:** 2026-09-19
**Covers:** the changes merged to `main` in commits `e9ece27` (auth codes) and `6610979` (near-me, discovery tabs, location search).

Every entry below is a real problem from this project, found while the app already had real users. Each one follows the same shape:

- **What people saw**: the symptom.
- **Why it happened**: the root cause.
- **The fix**: what changed, with links to the code.
- **Take away**: the lesson that applies to your own work.

**How to use this doc:** read "What people saw", then try to guess the cause before reading "Why it happened". Guessing first is how you get better at debugging.

## At a glance

| # | Problem | Kind of bug |
| --- | --- | --- |
| 1 | "Near me" only matched identical text | Wrong data model |
| 2 | Choosing a location provider | Design / third-party APIs |
| 3 | "New" tab wasn't sorted by newest | Silent failure |
| 4 | "All" tab repeated and skipped people | Pagination |
| 5 | Discovery quietly dropped whole pages | Over-strict validation |
| 6 | Other users' coordinates could leak | Security / privacy |
| 7 | Reset codes were readable in the database | Security |
| 8 | "Location search unavailable" | Debugging: stale server |
| 9 | One rate limit counted everything | Shared state |
| 10 | Shipping changes to live users | Process |

---

## 1. "Near me" only matched identical text

**What people saw.** The Near me tab only showed people whose location was spelled exactly like theirs. Someone in "Ikeja" saw nobody from "Lagos Island", even though they are a short drive apart.

**Why it happened.** The query was an equality check on a string:

```ts
baseFilter.location = currentUserProfile.location; // "Lagos" === "Lagos"
```

A computer has no idea that Ikeja is near Lagos. Text is not geography. To ask "who is within 50 km?" you need numbers a database can measure.

**The fix.**

1. Each profile now stores a **GeoJSON point** (`locationCoords`) next to the readable `location` text, with a `2dsphere` index so MongoDB can search by distance. See [profile.ts](../../apps/api/src/model/profile.ts).
2. The location box is now a **search-as-you-type** field. The user must pick a suggestion, and typing afterwards clears the pick, so the saved text and coordinates can never disagree. See [LocationAutocomplete.tsx](../../apps/web/src/components/ui/LocationAutocomplete.tsx).
3. Near me runs a `$geoNear` aggregation: people within `radius` km (default 50, max 500), nearest first. See `listNearbyProfiles` in [profiles.service.ts](../../apps/api/src/modules/profiles/profiles.service.ts).

**Details that catch people out:**

- **GeoJSON is `[longitude, latitude]`**, the opposite of how we say "lat, lng". Swapping them puts Lagos in the ocean and MongoDB will not warn you.
- `$geoNear` must be the **first stage** of an aggregation. The simpler `$near` cannot be used with `countDocuments()`, which pagination needs for the total.
- Everyone in the same city shares the *same* coordinates, so many results tie at distance 0. Ties make paging unstable, so the sort adds `_id` as a tiebreaker: `{ distanceMeters: 1, _id: 1 }`.
- Coordinates come from a city or area centre, not a home address. So the UI says "In your area" instead of pretending to know "0.3 km away".

**Take away.** Pick a data model that can answer the question you are asking. If you find yourself string-matching to approximate something physical, the data model is wrong.

---

## 2. Choosing a location provider

**The problem.** Something has to turn "Ikej" into a real place with coordinates. That is a *geocoding* service, and there are many.

**What we compared.** Cost as the app grows, whether autocomplete is supported, and, less obviously, **whether the terms allow you to store the results**. We save coordinates in our own database, and some providers (for example Google, and Mapbox's standard geocoding API) restrict that. OpenStreetMap-based providers (Photon, LocationIQ, Geoapify) are generally friendlier to it, with attribution required. Terms change, so read the current ones before you depend on them.

**The fix.** Everything provider-specific lives in **one file**: [geocode.service.ts](../../apps/api/src/modules/geocode/geocode.service.ts). The rest of the app only ever sees `{ label, lat, lng }`. That gave us:

- **A private key.** The browser calls *our* API, and our API calls the provider. The key never reaches the browser.
- **A fallback.** LocationIQ is primary. If it fails or rate-limits, the service falls back to Photon (no key needed), so users still get results.
- **Caching.** Repeat searches ("lagos") are served from memory for an hour.
- **Two rate limits.** A per-user limit on our own endpoint, plus the provider's own limits.

**Things we discovered by testing the real API, not guessing:**

| Response | Meaning |
| --- | --- |
| `404` from LocationIQ | "No matches", *not* an error. Treating it as a failure would show "search unavailable" for a normal typo. |
| `401` | Bad key. |
| `429` | Rate limited (the free tier has a per-second cap). We hit this ourselves during testing by firing searches back to back, and the fallback answered correctly. |

Their key only works as a **URL query parameter**, so the code never logs URLs or raw error objects, or the key would leak into logs.

**Take away.** Put third-party services behind a small adapter you own. Read the provider's *actual* responses before writing error handling. Read the terms before you store their data.

---

## 3. The "New" tab wasn't sorted by newest

**What people saw.** The New tab showed profiles in no obvious order, and "joined X days ago" was always 0.

**Why it happened.** The code sorted by a field that **does not exist**:

```ts
.sort({ createdAt: -1 })
```

The Profile schema never enabled `timestamps`, so no profile had a `createdAt`. MongoDB does not complain about sorting by a missing field. Every document simply ties, and you get whatever order the database feels like.

**The fix.** Sort by `_id` instead. A MongoDB `ObjectId` begins with the **time it was created**, so `{ _id: -1 }` is newest-first for free, and it is unique, so paging never ties. `joinedDaysAgo` is now derived from `_id.getTimestamp()`. See `daysSinceCreated` in [profiles.service.ts](../../apps/api/src/modules/profiles/profiles.service.ts).

**Take away.** A query that returns *something* is not a query that works. When a sort or filter "does nothing", check that the field exists in real documents. Note also that this is when the *profile* was created, not the account. If you need exact dates going forward, add `{ timestamps: true }` to the schema.

---

## 4. The "All" tab repeated and skipped people

**What people saw.** Paging through Discover showed some people twice and never showed others.

**Why it happened.** "Random" and "paged" fight each other. Pages are fetched as separate requests (`skip` and `limit`). If each request shuffles independently, page 2 has no idea what page 1 showed.

An earlier fix used a seed, so the same seed gave the same shuffle. That was better, but it shuffled the **whole list**, so one person's position depended on everyone else. If a search narrowed the list, or a new profile arrived, the entire order changed.

**The fix.** Give every profile its **own** sort key derived only from `(seed, id)`, then sort by that key. A person's position relative to anyone else never depends on who else is in the list. See [seeded-order.ts](../../apps/api/src/modules/profiles/seeded-order.ts). The page picks one seed per visit ([DiscoveryPage.tsx](../../apps/web/src/pages/DiscoveryPage.tsx)), so the order is random per visit but stable while paging.

We tested it on a real database at page sizes 8, 5 and 3: everyone appeared exactly once.

**Known limit.** If someone signs up *between* two page clicks, one profile can shift across a page boundary and show twice. Offset paging cannot prevent that. It needs cursor-based paging.

**Take away.** Anything "random" that spans several requests must be *reproducible*. And a stable order needs a tiebreaker.

---

## 5. Discovery quietly dropped whole pages

**What people saw.** Some people never appeared in Discover, with no error anywhere.

**Why it happened.** The frontend validates every API response with a Zod schema. The schema was stricter than the database (it required `profilePicture` to be a valid URL, and `occupation` to be present). One profile that did not match made the parse throw, and the frontend threw away the **entire page** of eight because of one bad record.

**The fix.** Make the schema match what the database actually guarantees (`occupation` optional with a default, `profilePicture` any string or null). See [packages/shared/src/api.ts](../../packages/shared/src/api.ts).

**Take away.** Validation at a boundary should match reality, and one bad record should not hide seven good ones. Whenever a check can silently discard data, ask what happens to everything *around* the bad item.

---

## 6. Other users' coordinates could leak

**What people saw.** Nothing, and that was the danger. Nothing had leaked yet, but it would have.

**Why it happened.** Several endpoints (likes, matches, conversations, discovery) copy whole profile documents into their responses:

```ts
return profiles.map((p) => ({ ...p.toObject(), id: p.userId.toString() }));
```

The moment we added `locationCoords`, every one of them would have started sending other people's locations to the browser. This pattern makes every *new* field public by default.

**The fix.** Hide the field at the source with `select: false` in the schema. No query returns it unless it opts in with `.select('+locationCoords')`. Only two places opt in: your own profile (the edit form needs it) and the near-me lookup of *your* location. See `getProfileById(userId, viewerId)` in [profiles.service.ts](../../apps/api/src/modules/profiles/profiles.service.ts). We also tested that other users' profiles never include it.

**Take away.** Make the safe thing the default. Prefer an **allowlist** ("send these fields") to a **blocklist** ("remember to remove that one"). Spreading a whole database object into a response is a hazard every time you add a field.

---

## 7. Reset codes were readable in the database

**What people saw.** Passwords were fine (they were hashed with bcrypt), but the six-digit email-verification and password-reset codes sat in the database as plain text.

**Why it matters.** Anyone who can read the database (a leaked backup, an over-permissive database user) could request a reset for any account, read the live code, and take it over. They were also generated with `Math.random()`, which is predictable and not meant for security.

**The fix.** See [one-time-code.ts](../../apps/api/src/core/auth/one-time-code.ts) and [auth.service.ts](../../apps/api/src/modules/auth/auth.service.ts):

- Codes come from `crypto.randomInt` (a secure source).
- Only an **HMAC** of the code is stored, never the code. The plain code goes to the user's inbox.
- Comparison uses `timingSafeEqual`.

**The mistake worth studying.** The first idea was "store a SHA-256 hash". That would not have helped. There are only **1,000,000** possible six-digit codes, so anyone with the hash can try all of them in well under a second. A plain hash only protects secrets that are hard to guess. An **HMAC** mixes in a secret key that lives on the server (`JWT_SECRET_KEY`), not in the database, so a database leak alone reveals nothing.

**Two smaller details.** The HMAC input includes the purpose and the email, so a verification code cannot be replayed as a reset code, or on another account. And the email is lowercased before hashing, because the User model lowercases emails but incoming requests do not. Without that, a person who signed up as `Ada@x.com` could never verify.

**What we tested.** The real signup, verify, forgot-password, reset and resend functions, run against a throwaway database with the mail library intercepted so no email was sent.

**Still open (good exercises):** limit how many wrong guesses an account gets, and encrypt chat messages, which are also stored as plain text.

**Take away.** "Hashed" is not a magic word. Ask how many inputs an attacker would have to try.

---

## 8. "Location search is unavailable"

**What people saw.** The location box always said search was unavailable.

**How it was solved.** No guessing, two quick checks:

1. Request the route with no login. **`401`** would mean the route exists (it just needs a login). **`404`** meant the route did not exist at all. It was `404`.
2. Look at the process that was serving the API. Its command line was `node dist/server.js`: the **compiled build from the day before**, which had no idea the new route existed. The fix was to restart on the source code with `npm run dev`.

**Two lessons hid in here.**

- **Which code is actually running?** `npm run dev` (source, reloads on change) and `npm start` (compiled `dist/`, does *not* reload) behave differently. If your change "does nothing", make sure the server is running it.
- The search box showed the *same* message for every failure (bad login, rate limit, outage, missing route), so it hid the real cause. The server now logs the provider and status code for each failure, which is what makes a bug like this diagnosable.

**Take away.** When something "doesn't work", first prove what is actually running, then look at the real status code.

---

## 9. One rate limit counted everything

**The bug.** The rate limiter kept a single counter per IP address, shared by *every* limiter. Adding a stricter limit on the location endpoint (40 per minute) would have mixed with the app-wide limit (120 per minute) and produced confusing results.

**The fix.** The limiter takes an optional `scope`, which becomes part of the counter's key, so each route-specific limit counts separately. Existing behaviour is unchanged when no scope is given. See [rate-limiter.ts](../../apps/api/src/http/middleware/rate-limiter.ts).

**Take away.** Shared mutable state is a bug waiting for the second user of it. When you add a second caller, re-read how the first one stored things.

---

## 10. Shipping changes to live users

Real users change how you ship. What we did, and why:

- **Existing data does not have your new field.** Profiles saved before this change have no coordinates, so Near me is empty for them until they re-save their location. When you add a requirement, decide up front: backfill old data, or degrade gracefully, and tell users.
- **Your `.env` is not deployed.** The location key sits in a local file. The hosting dashboard has its own environment variables. We also made the key *optional* (with a fallback), so a missing variable cannot take the site down.
- **Frontend and API deploy separately.** For a few minutes the new frontend can talk to the old API (or the reverse). Deploy at a quiet time and know which requests can fail during the gap.
- **Old data can make new code fail.** Verification codes stored as plain text before the change stopped working after it. Codes last 10 minutes, so the plan was: affected users press "resend".
- **Test with the same steps the host runs.** Render installs with `npm install --include=dev` and then builds. We ran a fresh install, the typecheck and the full build on the *merged* result before pushing.
- **Test against a real database, not a mock.** An in-memory MongoDB and 25 checks covering the three tabs and privacy caught things reasoning alone would not.
- **Don't send real emails from tests.** We intercepted the mail library instead.
- **Make the tests decide, not you.** One test failed because the expected value was a guess (a 128 km distance). Working it out by hand gave 114 km, which the database was right about. The fix was to compute the expected value independently (a separate haversine calculation) rather than swap in another guess. When a test fails, decide whether the *code* or the *test* is wrong, and prove which.
- **Merge without disturbing unfinished work.** `main` had a commit `test` lacked, so the merge happened in a temporary checkout, the merged result was built there, and only then pushed. Unfinished, uncommitted work in the main working folder was never touched.
- **Small, separate commits.** Auth and near-me are separate commits, so either can be reverted alone.

---

## Habits to take with you

1. **Prove your assumptions.** Check the field exists, check which process is running, check the status code.
2. **A query that returns something is not a query that works.**
3. **Make the safe thing the default.** Allowlists over blocklists; `select: false` over "remember to remove it".
4. **Keep third-party services behind an adapter you own,** and read their real responses and terms.
5. **Ask how many inputs an attacker would try** before trusting a hash.
6. **Anything random across requests must be reproducible.**
7. **Test against a real database,** and compute expected values independently.
8. **Assume live data is older than your code.** Plan for records that predate your change.
9. **Log the cause,** never just "something went wrong".

## Practice problems

Each of these is a real gap in the project right now:

- Limit wrong guesses on verification and reset codes per account.
- Write a script that gives existing users coordinates from their saved `location`, then run it safely.
- Add a radius picker to the Near me tab (the API already accepts `radius`).
- Show the `distanceLabel` on the profile cards.
- Encrypt stored chat messages, and plan how to handle the ones already saved.
- Convert the New tab to cursor-based paging so a sign-up mid-browse can never shift a page.
