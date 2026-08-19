# Bakery ERP Production Migration

## Current production database

The Bakery ERP production database is the new Supabase project **Bakery ERP Production**, located in the Singapore region (`ap-southeast-1`). The project reference is `npiifxjxwvxetanhbugk`. The existing `Invenstory App` project was not modified.

The database contains the fourteen ERP tables, seven PostgreSQL enums, unique indexes, reporting indexes, identity-backed integer primary keys, decimal quantity/value columns, and the PostgreSQL updatedAt triggers required to preserve the former MySQL `onUpdateNow()` behavior. The schema bootstrap is recorded in `drizzle/0004_supabase_initial.sql`, and timestamp triggers are recorded in `drizzle/0005_supabase_updated_at_triggers.sql`.

## Runtime and ORM changes

The Drizzle schema now uses `pgTable`, `pgEnum`, PostgreSQL numeric types, and identity-generated integer keys. The server uses `drizzle-orm/postgres-js` with the `postgres` driver. `SUPABASE_DATABASE_URL` is preferred when present, while `DATABASE_URL` remains a local-development fallback. PostgreSQL `returning()` is used for new item, purchase, adjustment, order, recipe, shop, sale, and import-batch identifiers; no MySQL `insertId` dependency remains in production code.

The reproducible migration command is:

```bash
pnpm drizzle-kit generate --config=drizzle.pg.config.ts
```

The PostgreSQL-specific configuration writes to `drizzle/pg/`, avoiding malformed legacy MySQL snapshot metadata under the original migration directory. The generated SQL was reviewed, and the production database was applied through Supabase migrations rather than through local test data or destructive reset operations.

## Authentication impact

Authentication remains **Manus OAuth**, not Supabase Auth. The OAuth callback still receives the authorization response through the server, upserts the authenticated user in the `users` table, and issues the existing HTTP-only session cookie. Moving the database to Supabase does not change the ERP roles, protected tRPC procedures, admin approval checks, or owner-admin behavior.

Before Cloudflare production deployment, the Worker or Pages adapter must preserve the existing callback route, cookie attributes, forwarded-protocol handling, and configured OAuth redirect URL. The final production domain must be added to the OAuth provider configuration before live login testing.

## Storage impact

The application stores file bytes through the existing server-side storage helper and keeps file references separate from relational data. The Supabase migration does not move binary files into PostgreSQL and does not add BLOB or BYTEA columns. Cloudflare deployment must retain the server-side storage environment variables and must not expose storage credentials to browser code.

## Transaction impact

The import apply and backup restore workflows continue to use the Drizzle transaction callback when the database adapter provides `transaction`. PostgreSQL supports these transaction boundaries through the new Drizzle adapter. The restore workflow remains dependency-safe, and the import workflow continues to reject approved duplicate rows before writing. The adapter migration changed identifier retrieval from MySQL `insertId` to PostgreSQL `returning()` without changing atomicity or business formulas.

## Cloudflare readiness and blocker

Cloudflare account access is available for **Swammarn30@gmail.com's Account**. Cloudflare documentation requires `nodejs_compat` and a current compatibility date for Node-based database drivers and Hyperdrive bindings [1]. Hyperdrive can connect Workers or Pages Functions to an external PostgreSQL database, including Supabase, and Postgres.js is supported with Node.js compatibility [1] [2].

The current application is an Express server that starts a Node HTTP listener, mounts Vite/static middleware, and exposes tRPC through Express request/response objects. It cannot be treated as a complete Cloudflare Worker simply by adding a `wrangler.toml` file. A production deployment therefore still requires an explicit Worker or Pages Functions adapter, a Hyperdrive binding, static-asset handling, and a verification of the OAuth callback and cookie path. No Cloudflare deployment has been attempted.

## Verification completed

The Supabase project is `ACTIVE_HEALTHY`, the live database accepted a non-destructive `select 1` query, the four updatedAt triggers were verified in PostgreSQL system metadata, TypeScript passed, all **45 Vitest tests** passed, and the production build passed. The remaining deployment work is the Cloudflare runtime adapter and its user-confirmed production deployment configuration.

## References

[1]: https://developers.cloudflare.com/hyperdrive/get-started/ "Cloudflare Hyperdrive Get Started"
[2]: https://developers.cloudflare.com/pages/functions/bindings/ "Cloudflare Pages Function Bindings"
