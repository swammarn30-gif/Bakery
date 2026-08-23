# Production sign-in diagnosis notes

## 2026-08-23 live reproduction

- The Vercel production application at `https://bakery-alpha-puce.vercel.app/` loads the email/password sign-in screen normally.
- A direct live `POST /api/auth/sign-in` using the existing form credentials completed with HTTP `200`; this confirms the deployed password-auth proxy can reach Supabase Auth and accept the supplied account credentials.
- Reproducing the client’s current post-login behavior by placing the successful token response in the derived `sb-<project-ref>-auth-token` local-storage key and dispatching `supabase-auth-signed-in` did **not** move the UI beyond the sign-in page.
- The authenticated `auth.me` tRPC request returned a Vercel `500` error. Production runtime logs traced the failure to Node ESM resolution: `shared/lowStock.js` imported `/var/task/shared/calculations` without a JavaScript extension.
- The production fix changes that dependency to `./calculations.js` and adds a source-level regression test. Focused tests, TypeScript validation, and the Vercel frontend build pass. The unrelated local live-Supabase integration test still fails because the sandbox database password is stale.
- GitHub commit `2852cb7` deployed as Vercel production deployment `dpl_Hq49azB8DDJhSpTosbkUmq8M1k6c` with `READY` status. Reloading the production alias restored the authenticated administrator dashboard successfully. The password input and all tokens were deliberately excluded from this note.
- A clean browser validation then removed only the sandbox test session, returned to the production sign-in form, submitted the approved account through the form’s actual submit-button handler, and reached the authenticated administrator dashboard. This confirms the reported live Sign In issue is resolved end to end.
