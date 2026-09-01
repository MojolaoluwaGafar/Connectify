# Connecti

Connecti is a monorepo for the May 2026 full-stack cohort project. The repo contains a Vite + React frontend and a TypeScript Express API.

## Repository map

```text
apps/
  web/                 Frontend application
  api/                 Express + TypeScript API
packages/             Shared packages when needed
```

## Local setup

1. Install dependencies:

```powershell
npm install
```

2. Copy the API env template:

```powershell
copy apps\api\.env.example apps\api\.env
```

3. Update `apps/api/.env` with your local values, especially `MONGODB_URI` and JWT settings.

4. Start the app in development mode:

```powershell
npm run dev
```

or run each app individually:

```powershell
npm run dev:api
npm run dev:web
```

## Current project status

- Frontend: UI and demo auth flows are working in-browser using mock data fallback logic.
- API: app shell, routing, health checks, and socket server scaffolding are in place.
- Real backend features (auth, profiles, likes, matches, messages, preferences) are not fully implemented yet and still return 501 placeholders.

## Important technical notes

- The frontend API service should use the browser token store and perform redirect logic without calling React hooks from Axios interceptors.
- Socket.IO connections should authenticate with a valid JWT token before accepting a connection from the frontend.
- The project still relies on mock data for several demo flows until the backend modules are implemented.
