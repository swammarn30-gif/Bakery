# Production sign-in diagnosis notes

## 2026-08-23 live reproduction

- The Vercel production application at `https://bakery-alpha-puce.vercel.app/` loads the email/password sign-in screen normally.
- A direct live `POST /api/auth/sign-in` using the existing form credentials completed with HTTP `200`; this confirms the deployed password-auth proxy can reach Supabase Auth and accept the supplied account credentials.
- Reproducing the client’s current post-login behavior by placing the successful token response in the derived `sb-<project-ref>-auth-token` local-storage key and dispatching `supabase-auth-signed-in` did **not** move the UI beyond the sign-in page.
- The next diagnosis target is the authenticated `auth.me` tRPC request and its Vercel bearer-validation/database resolution path. The password input and all tokens were deliberately excluded from this note.
