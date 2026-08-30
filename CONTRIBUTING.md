# Contributing to Connecti

We collaborate through small, reviewable pull requests. Do not commit directly
to `main`.

## First-time setup

1. Fork the repository if you are not a collaborator; otherwise clone it.
2. Run `npm install` in the repository root.
3. Run `npm run typecheck` and `npm run build` before starting work.
4. Read the relevant architecture document in `docs/architecture/`.

## Daily workflow

1. Choose or create a GitHub issue before writing code.
2. Update `test`, then create a branch from it:

   ```powershell
   git switch test
   git pull origin test
   git switch -c feature/123-profile-discovery
   ```

3. Keep a branch focused on one issue. Do not mix styling, backend, and
   unrelated cleanup in the same pull request.
4. Run the checks locally:

   ```powershell
   npm run typecheck
   npm run build
   ```

5. Commit using a clear prefix:

   ```text
   feat(api): add profile discovery endpoint
   fix(web): prevent empty message submission
   docs: clarify profile completion rules
   chore: update development setup
   ```

6. Push the branch and open a pull request targeting `test`:

   ```powershell
   git push -u origin feature/123-profile-discovery
   ```

7. Pull the latest `test` branch before raising or updating a PR:

   ```powershell
   git fetch origin
   git rebase origin/test
   ```

8. Link the issue with `Closes #123`, respond to review comments, and merge
   only after checks and required review pass.

## Where work belongs

| Work type                                          | Location    |
| -------------------------------------------------- | ----------- |
| Browser UI and client API calls                    | `apps/web/` |
| HTTP routes, services, validation, and persistence | `apps/api/` |
| Code reused by at least two apps                   | `packages/` |
| Product and technical decisions                    | `docs/`     |
| Repository automation                              | `.github/`  |

Do not copy code between apps. Promote a utility, contract, or component to a
package only after it is truly shared.

## Pull-request standards

- Keep changes small enough to review in one sitting.
- Add or update documentation when behavior changes.
- Never commit `.env` files, tokens, credentials, or `node_modules`.
- Do not change the API contract without updating the corresponding document.
- Ask for help early if a change crosses team boundaries.
- All students must push their feature branch and pull from `test` before final review.
