# Cloudflare Production Secret and Binding Inventory

## Required Worker bindings

| Binding | Source | Purpose | Secret status |
|---|---|---|---|
| `HYPERDRIVE` | Cloudflare Hyperdrive configuration `9a951eeecff64bba8a98ab7029d4d876` | Supplies the Supabase PostgreSQL connection string to the Worker at runtime | Sensitive, managed by Cloudflare |
| `ASSETS` | Wrangler assets binding for `./dist/public` | Serves the React production bundle and supports SPA fallback | Not a secret |

The Hyperdrive configuration is named `bakery-erp-supabase` and has SQL response caching disabled so ERP reads observe writes immediately. The Supabase password is stored inside Hyperdrive and is not present in `wrangler.toml`, `worker.ts`, migration SQL, or GitHub.

## Required Cloudflare secrets and variables

| Name | Required in Worker | Exposure | Purpose |
|---|---:|---|---|
| `JWT_SECRET` | Yes | Server-only secret | Signs and verifies the existing session cookie |
| `VITE_APP_ID` | Yes | Build-time/browser-visible identifier | Manus OAuth application identifier |
| `OAUTH_SERVER_URL` | Yes | Server-side URL | Manus OAuth token exchange endpoint |
| `VITE_OAUTH_PORTAL_URL` | Yes for frontend build | Browser-visible URL | Login portal URL used by the frontend |
| `OWNER_OPEN_ID` | Yes | Server-side identifier | Determines the owner-admin role during user upsert |
| `OWNER_NAME` | Recommended | Server-side metadata | Owner information used by the application shell/auth context |
| `BUILT_IN_FORGE_API_URL` | Yes if storage proxy remains enabled | Server-side URL | Built-in storage/API endpoint |
| `BUILT_IN_FORGE_API_KEY` | Yes if storage proxy remains enabled | Server-only secret | Server authorization for storage/API calls |
| `VITE_FRONTEND_FORGE_API_URL` | Yes if frontend uses built-in APIs | Browser-visible URL | Frontend built-in API endpoint |
| `VITE_FRONTEND_FORGE_API_KEY` | Only if frontend uses built-in APIs | Browser-visible credential by design | Frontend built-in API access; use only where the platform expects a frontend key |

`SUPABASE_DATABASE_URL` remains useful for local PostgreSQL smoke tests and non-Hyperdrive execution. The deployed Worker uses `HYPERDRIVE.connectionString`, so the raw Supabase password does not need to be added as a Worker secret separately.

## OAuth and routing requirements

The final Cloudflare hostname must be registered as an allowed OAuth callback origin. The callback path remains `/api/oauth/callback`. API, OAuth, and storage-proxy routes are sent to the shared Express server through `cloudflare:node`; other GET requests are served from the assets binding, and an HTML-accepting 404 falls back to `/index.html` for client-side ERP routes.

Server-only values must be created in Cloudflare as encrypted Worker secrets. Values beginning with `VITE_` are build-time values and may be included in the browser bundle; they must never contain `JWT_SECRET`, database passwords, or server storage keys.
