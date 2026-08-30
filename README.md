# Connecti

Connecti is a collaborative full-stack project for the May 2026 cohort. It is
an npm-workspaces monorepo with a Vite React frontend and a TypeScript Express
API.

## Repository map

```text
apps/
  web/
    connectify/        Frontend application (do not change the built UI design)
  api/                 TypeScript Express API
packages/              Shared code when two or more apps need it
docs/
  architecture/        System and API decisions
  collaboration/       Student workflow and ownership
.github/               Repository templates and automation
```

## Monorepo workflow

Use the root workspace scripts and keep every feature work scoped to one app or
package:

```powershell
npm install
npm run typecheck
npm run build
npm run dev
# or run each app individually:
npm run dev:api
npm run dev:web
```

## Git workflow for students

All student work happens from a feature branch created from `test`, and every
student must push their branch and pull the latest `test` updates before opening
or updating a PR.

```powershell
git switch test
git pull origin test
git switch -c feature/your-task-name
git push -u origin feature/your-task-name
```

Before opening a PR, refresh with the latest `test` branch:

```powershell
git fetch origin
git rebase origin/test
```

Do not merge directly to `main`. Open a pull request targeting `test`, and only
merge after review and CI pass.

Read [the contribution guide](./CONTRIBUTING.md) before making your first
change. The backend contract is derived from the current web app in
[`apps/web/connectify/src`](./apps/web/connectify/src) and documented in
[`docs/architecture/frontend-derived-backend-contract.md`](./docs/architecture/frontend-derived-backend-contract.md).
