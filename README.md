# Connectify

Connectify is a dating/connection app built as a monorepo for the May 2026 full-stack cohort. People sign up, build a profile, discover others, like each other, and — once two people have liked each other (a match) — chat in real time.

## Features

- **Auth** — email/password signup with a 6-digit email verification code, login, forgot/reset password, change password, account deletion, and Google sign-in.
- **Profiles** — create/edit a profile with a photo (JPEG/PNG, max 5 MB, stored on Cloudinary).
- **Discovery** — paginated browse with search and three tabs: **All** (random order, stable while paging), **New** (newest accounts first), **Near me** (people within 50 km of your saved location, nearest first).
- **Likes & matches** — directed likes; a match happens when two people like each other. Both people get a live "It's a match" popup.
- **Messaging** — real-time chat between matches, with online status, typing indicators, per-conversation unread-count badges, and live-updating conversation previews.
- **Notification bell** — header bell with an unread badge and a dropdown of recent matches, likes, and messages.
- **Settings** — "New matches" / "New messages" toggles that silence the toast/popup (stored per browser; the bell always keeps a full record).

## Repository map

```text
apps/
  web/        Vite + React + Tailwind frontend
  api/        TypeScript Express REST API + a separate Socket.IO server
packages/
  shared/     Zod schemas and types shared by web and api (built to dist/)
docs/         Architecture notes and the student collaboration workflow
render.yaml   Render Blueprint (api, socket, and static web services)
```

The API workspace produces **two separate processes**:

| Process | Entry point | Default port | Purpose |
| --- | --- | --- | --- |
| REST API | `src/server.ts` | 3001 | Auth, profiles, likes, conversations |
| Socket server | `src/chatServer.ts` | 3002 | Real-time chat, presence, live notifications |

The REST API pushes live events (new match, new like) to the socket server over a small secret-protected internal HTTP endpoint (`POST /internal/notify`). See [docs/architecture/backend.md](docs/architecture/backend.md).

## Local setup

1. Install dependencies (from the repo root):

```powershell
npm install
```

2. Create your env files from the templates:

```powershell
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
```

3. Fill in `apps/api/.env` — at minimum `MONGODB_URI` and `JWT_SECRET_KEY` (see [Environment variables](#environment-variables)).

4. Start everything (API + socket server + web) together:

```powershell
npm run dev
```

Or run them individually: `npm run dev:api`, `npm run dev:socket`, `npm run dev:web`.

The web app runs at http://localhost:5173, the API at http://localhost:3001, and the socket server at http://localhost:3002.

### Testing real-time features locally

Matches, live notifications, and chat need two logged-in accounts at once. Use two different browsers, or one normal window plus an incognito window — tabs in the same browser share one login token.

## Scripts

Run from the repo root:

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs api, socket server, and web together |
| `npm run build` | Builds `shared`, then `api`, then `web` (order matters) |
| `npm run typecheck` | Builds `shared`, then type-checks every workspace |
| `npm run lint` | Lints workspaces that define a lint script |

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run typecheck`, and `npm run build` on every pull request and on pushes to `main`. There are no automated tests yet.

`@connecti/shared` exports its **compiled** `dist/` output, so it must be built before `api` or `web` can compile against it. The root scripts do this for you, and each workspace's own `build` script also builds `shared` first so isolated builds (e.g. on Vercel) still work.

## Environment variables

### `apps/api/.env`

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET_KEY` | yes | Signs login tokens. **Must be identical on the API and socket services** |
| `JWT_EXPIRES_IN` | no | Default `7d` |
| `PORT` | no | REST API port, default `3001` (Render injects this) |
| `SOCKET_PORT` | no | Socket server port, default `3002` (a platform-injected `PORT` wins) |
| `INTERNAL_SOCKET_SECRET` | no | Shared secret for the API → socket bridge. **Must match on both services** |
| `SOCKET_INTERNAL_URL` | no | Socket service URL when API and socket run on separate hosts; defaults to `http://localhost:<SOCKET_PORT>` |
| `CORS_ORIGIN` | no | Comma-separated allowed frontend origins, default `http://localhost:5173` |
| `CLIENT_URL` | no | Frontend URL, default `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | for Google login | Must match the web app's client ID |
| `CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | for photo upload | Cloudinary credentials |
| `BREVO_API_KEY`, `EMAIL_FROM` | for email | Transactional email via Brevo (falls back to SMTP in development) |
| `APP_EMAIL`, `APP_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | dev fallback | Gmail/SMTP settings used when Brevo isn't configured |
| `NODE_ENV`, `LOG_LEVEL` | no | Defaults `development` / `info` |

### `apps/web/.env`

| Variable | Notes |
| --- | --- |
| `VITE_BASE_URL` | REST API base URL (e.g. `http://localhost:3001`) |
| `VITE_SOCKET_URL` | Socket server URL (e.g. `http://localhost:3002`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID |

`VITE_*` values are baked into the bundle **at build time** — changing one on a host requires a rebuild/redeploy, not just a restart.

## Deployment (Render)

[`render.yaml`](render.yaml) defines three services. Create them with **New → Blueprint** in Render — a manually created web service ignores `render.yaml` (and will fall back to generic defaults like `npm run dev`, which runs out of memory).

| Service | Type | Build output / start command |
| --- | --- | --- |
| `connecti-api` | Node web service | `npm run start -w @connecti/api` |
| `connecti-socket` | Node web service | `npm run start:socket -w @connecti/api` |
| `connecti-web` | Static site | publishes `apps/web/dist`, rewrites `/*` to `/index.html` for client-side routing |

The frontend is a static Vite build, so it can alternatively be hosted on Vercel (`apps/web/vercel.json` already contains the SPA rewrite) instead of the Render static site.

After the first deploy, fill in the cross-service values in each service's Environment tab:

- `connecti-api`: `CORS_ORIGIN` and `CLIENT_URL` = the frontend URL; `SOCKET_INTERNAL_URL` = the socket service URL.
- `connecti-socket`: `CORS_ORIGIN` = the frontend URL, and copy `JWT_SECRET_KEY` and `INTERNAL_SOCKET_SECRET` **exactly** from `connecti-api`.
- Frontend: `VITE_BASE_URL` and `VITE_SOCKET_URL` = the API and socket URLs, then redeploy.
- Google Cloud Console: add the frontend URL to the OAuth client's authorized JavaScript origins.

### Deployment gotchas we hit

- **`--include=dev` on installs.** `NODE_ENV=production` makes npm skip devDependencies (including `typescript` and every `@types/*`), which breaks the build. The build commands pass `--include=dev`.
- **Bind to the platform's `PORT`.** Render assigns each service its own port; the socket server uses `PORT` when set and only falls back to `SOCKET_PORT` locally.
- **Memory cap.** The `start` scripts pass `--max-old-space-size=460` so Node stays under Render's 512 MB limit.
- **Matching secrets.** A mismatched `JWT_SECRET_KEY` makes the socket server accept a connection and then immediately disconnect it (`io server disconnect`). A mismatched `INTERNAL_SOCKET_SECRET` silently drops live match/like pushes.
- **Dependencies belong to the workspace that imports them.** A package declared only in the root `package.json` works locally (hoisting) but fails on hosts that install one workspace at a time.
- **Brevo IP restrictions.** Render's free tier has no fixed outbound IP; deactivate Brevo's "Authorized IPs" restriction for API keys, or the email API will reject requests.

## Known limitations

- **The notification bell is not persisted.** Its list lives in browser memory and clears on reload.
- **Notification preferences are per-browser.** The `/v1/preferences` endpoints are still `501 Not Implemented`; the Settings toggles are stored in `localStorage`.
- **"Near me" uses place-level coordinates**, not your exact position. The location picked on your profile is geocoded (via LocationIQ when `LOCATIONIQ_API_KEY` is set, otherwise — or if LocationIQ fails or rate-limits — the keyless Photon service at `GEOCODER_URL`) to the centre of a city or area, so distances are approximate and everyone in one area is equidistant. Profiles saved before this feature have no coordinates until their owner re-saves their location. The public Photon server is fair-use only, and LocationIQ's free tier has daily and per-second caps — check both before heavy traffic.
- **Presence is in-memory.** The socket server's online-user map lives in one process, so running more than one socket instance would need the Socket.IO Redis adapter.
- **`/v1/health/ready`** reports `database: not-configured` regardless of the actual database connection.

## More documentation

- [Backend architecture](docs/architecture/backend.md) — as-built design, data model, sockets, security.
- [API contract](docs/architecture/frontend-derived-backend-contract.md) — routes, request/response shapes, product rules.
- [Student collaboration workflow](docs/collaboration/student-workflow.md) — branching, PRs, review.
