# Project TODO

- [x] Define the ERP domain model for items, purchases, daily production, packaging, orders, recipes/BOM, issued quantities, sales, shops, approvals, costing, reports, imports, exports, and backups.
- [x] Implement database schema and migrations for the ERP domain.
- [x] Implement item master management with active/inactive and classification fields.
- [x] Implement purchase entry and monthly average costing with carried-forward cost behavior.
- [x] Implement date-selected Production table with exact Used and Closing formulas.
- [x] Implement date-selected Packaging table with exact Used and Closing formulas.
- [x] Implement carry-forward helper from approved previous Closing into next-day Opening.
- [x] Implement historical editing with dependent recalculation.
- [x] Implement Order workflow separately from Sale.
- [x] Implement maintainable Recipe/BOM with effective dates and active-version listing.
- [x] Implement auto-generated Issued quantities with free manual override and preservation of overrides.
- [x] Implement Opening Stock proposal workflow with pending visual state and admin approval.
- [x] Implement Stock Adjustment proposal workflow with audit trail and admin approval.
- [x] Implement finished-goods Sale table with exact Opening + Produce - Sell formula.
- [x] Implement multi-product, multi-shop Sale breakdown without duplicate main sale rows.
- [x] Complete full date-range report views/API coverage for Production, Packaging, Sale, Purchase, Inventory, Costing, Item History, and summaries, including dashboard tables and per-item costing.
- [x] Implement item-by-item history report with quantity/value separation and totals.
- [x] Implement one-workbook date-range Excel export for Production, Packaging, and Sale sheets.
- [x] Add protected Excel import apply logic for validated rows, duplicate/approved-data protection, import audit state, atomic transaction handling, and reviewed-UI application.
- [x] Implement backup restore with schema-version compatibility and schema-0 migration, safe transactional handling, dependency-safe ordering, approval/import-batch metadata, and audit logging; versioned export/validation is complete.
- [x] Implement admin permissions and auditable approval records for current approval procedures.
- [x] Implement mobile-first responsive UI with touch-friendly readable tables.
- [x] Add unit tests for formulas, costing carry-forward, BOM issuance, sale shop totals, quantity/value separation, and import validation.
- [x] Run type checking, tests, build, and desktop/mobile visual verification.
- [x] Sync the current stable implementation into swammarn30-gif/Bakery and commit it with a clear message.
- [x] Confirm monthly Average Cost rule: carry forward the previous month’s applicable Average Cost when there are no purchases.
- [x] Confirm standard Excel import format and reject duplicate rows without overwriting approved data.
- [x] Implement the approved carried-forward costing rule in a protected monthly costing procedure.
- [x] Implement standard Excel import column validation and duplicate/approved-data safeguards at the validation layer.
- [x] Implement editable item master UI, including active/inactive toggles wired to items.update.
- [x] Integrate monthly average costing into a protected database-backed costing procedure.
- [x] Build Opening Stock proposal UI plus admin approval screen, and render pending values in a faded style while official calculations use approved values.
- [x] Replace the Sale placeholder with a real sale table supporting product rows, shop breakdown lines, total sell aggregation, and closing calculation.
- [x] Complete mobile-first Production and Packaging tables with horizontal scrolling and touch-friendly controls.
- [x] Implement editable sale rows keyed by date and product so repeat entry updates the existing main row instead of hitting the unique constraint.
- [x] Add persisted shop-breakdown detail viewing for sale rows; editing remains protected by the same save/upsert workflow.
- [x] Add calculation tests for multiple shops and repeated-save-safe sale aggregation.
- [x] Add tests for repeated save/update on the same sale date and product to verify idempotent sale aggregation behavior.
- [x] Add calculation tests covering multi-shop aggregation and multiple products in the sale workflow.
- [x] Implement full item-master edit controls for name, unit, type, and minimum stock.
- [x] Fix Opening Stock proposal submission to target the selected item row instead of the first row for the date.
- [x] Verify pending and approved Opening behavior per selected stock row through the selected-row lookup and approval tests.
- [x] Build Stock Adjustment submission UI and connect it to adjustments.submit.
- [x] Refactor item-master editing to controlled edit state so fields do not overwrite each other.
- [x] Add tests for Opening approval selected-row targeting, pending display, approval, and rejection behavior through shared approval-state coverage.
- [x] Add router-level tests for sales.save saving the same product/date twice and updating the existing sale row.
- [x] Add router-level tests for replacing persisted saleShopLines when re-saving the same sale row.
- [x] Implement persisted Sale row editing that loads an existing sale and shop lines into the Sale form before saving.
- [x] Add router-level tests proving re-saving an existing sale replaces persisted saleShopLines and updates the same sale row.
- [x] Preserve selected sale row id and original saleDate in the Sale edit form and pass both into sales.save.
- [x] Add tests proving a non-today persisted Sale edit updates the same row and replaces its shop lines.
- [x] Add router-level tests for Opening proposal approval targeting a specific stock row.
- [x] Add router-level tests for Opening approval and rejection updating only the selected stock row.
- [x] Add Recipe/BOM activate/deactivate procedures and UI controls.
- [x] Add editable multi-line Recipe/BOM maintenance for existing versions through multi-material version creation and active-version controls.
- [x] Add tests for effective-date Recipe/BOM version selection and activation behavior.
- [x] Expose inactive Recipe/BOM versions in the Orders panel and add Activate controls.
- [x] Add tests for recipe activation/deactivation and single-active-version enforcement.
- [x] Add router-level tests for recipes.setActive activation and deactivation, including single-active enforcement.
- [x] Add a test proving an inactive Recipe/BOM version can be reactivated and appears in the full recipe list.
- [x] Add Recipe/BOM update procedures for existing headers and saved material lines.
- [x] Add UI to load an existing Recipe/BOM version into an editable multi-line form and save it back to the same version.
- [x] Add tests proving existing Recipe/BOM versions can be edited and multi-line materials persist correctly.
- [x] Preserve and edit existing Recipe/BOM effectiveFrom and note fields during updates.
- [x] Support editing all persisted Recipe/BOM material lines without truncating lines beyond the first two through the complete editable lines JSON field.
- [x] Add tests proving Recipe/BOM header data and all material lines survive an existing-version update.
- [x] Validate Recipe/BOM line JSON before save and block malformed updates with a visible error.
- [x] Use one authoritative editable Recipe/BOM line model for persisted multi-line updates; malformed payloads are blocked before mutation.
- [x] Add shared validation tests for existing Recipe/BOM line payloads and malformed-input protection.
- [x] Disable duplicate Material/Qty fields during existing Recipe/BOM edits so the validated JSON line model is the sole update source.
- [x] Add tests proving persisted Recipe/BOM edits use one source of truth and preserve all lines without accidental loss at the pure-update layer.
- [x] Add unit tests for parseRecipeLinesJson covering valid multi-line payloads, invalid JSON, empty arrays, and invalid line shapes.
- [x] Add tests proving malformed Recipe/BOM edit payloads are rejected without clearing existing saved lines at the validation layer.
- [x] Add tests proving malformed Recipe/BOM edit payloads do not call recipes.update and cannot wipe existing saved lines.
- [x] Add router-level malformed-edit protection proving persisted Recipe/BOM lines remain unchanged after rejection.
- [x] Add tests for safeRecipeLinesUpdate covering valid multi-line replacement while preserving every provided line.
- [x] Add pure tests proving the persisted Recipe/BOM update model uses the authoritative line payload rather than duplicate fields.
- [x] Add tests showing a valid existing Recipe/BOM update preserves header data and all material lines.
- [x] Maintain pure Recipe/BOM authoritative-line-payload coverage so duplicate fields cannot replace the persisted line model.
- [x] Verify the existing-version UI disables duplicate Material/Qty fields and routes valid multi-line updates through the authoritative line model.

- [x] Inspect swammarn30.netlify.com UI and adapt Bakery ERP visual direction without exact copying, including shell branding and component-level layout treatment.
- [x] Verify the adapted design on desktop and mobile preview.

- [x] Keep Production and Packaging Daily Ledger as full spreadsheet-style tables with one item per row and all formula columns in one header row; use horizontal scrolling on mobile instead of card conversion.
- [x] Verify Production and Packaging ledger table structure, formulas, and responsive overflow behavior through code/tests without changing workflow or business logic; screenshots intentionally skipped per user request.

- [x] Make Production and Packaging navigation table-first by moving global KPI cards/summary content to Overview or Reports and keeping the Daily Ledger at the top of the operational view.
- [x] Verify the table-first workflow preserves formulas, inline editing, horizontal scrolling, and existing navigation behavior.

- [x] Fix React duplicate-key console error showing two children with key `/`.
- [x] Verify dashboard rendering and the 38-test suite after the duplicate-key fix.

- [x] Clarify Recipe/BOM setup for a Spanish finished good with separate Production ingredients and Packaging materials.
- [x] Verify or refine Auto Issued so Spanish demand drives Production flour/sugar quantities and Packaging box/sticker quantities separately, while manual overrides remain protected.
- [x] Add tests for the Spanish-style split Production/Packaging recipe flow.

- [x] Support standard units Kg, g, Viss, and pcs with explicit base-unit conversion rules; use g as the base for weight items and pcs as the base for count items, with server-side compatibility validation.
- [x] Normalize Purchase quantities and total purchase values into base quantity and base unit cost, including Kg-to-g and Viss-to-g conversion.
- [x] Recalculate monthly weighted average cost per base unit and use it for costing; preserve carried-forward cost when there are no purchases, with mixed normalized-unit test coverage.
- [x] Add Purchase UI fields for quantity unit and total purchase value, with unit-per-price derived automatically instead of requiring a unit price.
- [x] Add unit conversion, incompatible-unit rejection, mixed-unit monthly average, carry-forward, and 1200 Kg / 1,500,000 base-cost tests.

- [x] Assess current GitHub/Manus MySQL architecture against Supabase PostgreSQL and identify required schema, ORM, auth, storage, and transaction changes; Express/Node runtime remains a Cloudflare Workers/Pages compatibility consideration.
- [x] Prepare a Supabase migration design without changing ERP workflows, formulas, or UI behavior.
- [x] Prepare Cloudflare-compatible build/runtime configuration and secret requirements; publishing remains intentionally gated.
- [x] Validate migration readiness and document required Supabase/Cloudflare user actions and unresolved blockers; all local/remote checks pass, while actual Cloudflare publish and final OAuth-domain secret configuration remain user-gated.

- [x] Create a new Supabase project for Bakery ERP only after confirming organization, region, and any creation cost. Created `Bakery ERP Production` in `swammarn30-gif's Org`, region `ap-southeast-1`, project ref `npiifxjxwvxetanhbugk`, status `ACTIVE_HEALTHY`.
- [x] Migrate the Bakery ERP schema and database runtime from MySQL/Drizzle to Supabase PostgreSQL without changing workflows or formulas. Applied the reviewed bootstrap migration to project `npiifxjxwvxetanhbugk`; `SUPABASE_DATABASE_URL` is preferred by the server adapter; TypeScript, 45 Vitest tests, build, and a live `select 1` smoke test pass.
- [x] Prepare Cloudflare deployment configuration and production secrets. Added `wrangler.toml`, Worker assets binding, Hyperdrive binding `9a951eeecff64bba8a98ab7029d4d876`, and explicit Node compatibility flags; production secrets remain managed outside GitHub.

- [x] Audit and document Supabase/Cloudflare impacts for auth, storage, and transaction behavior in `docs/production-migration.md`.
- [x] Restore PostgreSQL-equivalent updatedAt behavior for items, users, dailyStock, and sales without changing business workflows through verified production triggers.
- [x] Restore a clean PostgreSQL Drizzle migration workflow with `drizzle.pg.config.ts` and the isolated `drizzle/pg/` output directory; generated SQL is reproducible without legacy malformed snapshots.

- [x] Implement the approved Cloudflare Worker/Pages adapter with nodejs_compat and a Hyperdrive binding path, preserving existing Express/tRPC routes, OAuth cookies, storage, and ERP behavior; Wrangler dry-run passed without publishing.

- [x] Add and verify Cloudflare SPA fallback so client-side ERP routes resolve to the built index instead of returning 404; `server/worker.routes.test.ts` executes full fetch-handler coverage.
- [x] Document the exact Cloudflare production secret and binding inventory for JWT, OAuth, owner, storage, and Supabase/Hyperdrive runtime values in `docs/cloudflare-secrets.md`.
- [x] Validate the Worker adapter against representative ERP, OAuth, storage, and deep-link paths through full fetch-handler tests and a Wrangler dry-run; final suite is 50 passing tests.

- [x] Audit and replace the remaining Manus OAuth authentication flow with Supabase Auth email/password while preserving protected ERP procedures and admin role checks; legacy Manus fallback is disabled unless explicitly enabled.
- [x] Configure Supabase Auth client/server secrets securely and synchronize Supabase Auth users with the ERP users table.
- [x] Add the approved `swammarn30@gmail.com` account securely and promote it to admin without exposing the password in code, GitHub, or logs.
- [x] Add authentication, admin authorization, and regression tests for the Supabase Auth flow; live sign-in resolves to ERP role `admin`, 53 Vitest tests pass, TypeScript passes, and production build passes.

- [x] Fully retire remaining Manus OAuth runtime registration and fallback now that Supabase Auth is the selected production authentication system; the unused OAuth module was removed and the runtime no longer registers it.
- [x] Add integration coverage proving a Supabase-authenticated admin can call an admin ERP procedure and a non-admin is denied; the final suite has 54 passing tests.

- [x] Fix Cloudflare’s `pnpm exec wrangler deploy` failure after the build succeeds, using the repository-local `deploy:worker` script (`wrangler deploy`) invoked by `pnpm run`.
- [x] Re-run TypeScript, tests, production build, and Wrangler dry-run after the deploy-command fix; TypeScript, 54 tests, production build, and Wrangler 4.15.2 dry-run pass.

- [ ] Sync the corrected `deploy:worker` package script and current Cloudflare configuration to the connected GitHub repository before retrying Cloudflare.
- [ ] Confirm Cloudflare is building the updated commit and retry with deploy command `pnpm run deploy:worker`.

- [ ] Replace the unrelated-history GitHub `main` branch with the approved verified local Bakery ERP source using the approved force-with-lease update.
- [ ] Confirm GitHub contains `deploy:worker` and retry Cloudflare from the new commit with `pnpm run deploy:worker`.

- [x] Fix Cloudflare Worker runtime error `require_stream` / code 10021 caused by the current Express/Node adapter bundle by switching to Cloudflare’s documented `httpServerHandler` entrypoint.
- [ ] Rebuild and verify the Cloudflare Worker runtime after replacing or isolating the incompatible Node request bridge. Local TypeScript, 54 tests, production build, and Wrangler dry-run pass; live Cloudflare retry remains pending.

- [ ] Audit the connected Cloudflare Worker project `swammarm` and configure its production variables/secrets and Hyperdrive binding for Bakery ERP.
- [ ] Validate `swammarm` after the secure configuration and confirm the Cloudflare retry/deployment result.

- [ ] Configure the confirmed `swammarm` Worker with secure Supabase/Auth/JWT/runtime secrets and the existing Bakery ERP Hyperdrive binding.
- [ ] Deploy `swammarm` after secret configuration and validate the live Worker URL, Supabase login, database access, and admin authorization.
- [x] Fix the Cloudflare Workers deploy failure caused by `TypeError: require_streams(...) is not a function` by pinning Wrangler to the known-compatible 4.15.2 release; local build, tests, and dry-run pass.
- [ ] Verify the deployed Worker serves the Bakery ERP application instead of Cloudflare’s placeholder page.
- [ ] Complete production login and smoke-test verification after the Worker route is live.
- [ ] Remove temporary admin-provisioning script only after production access is confirmed.
- [x] Fix Cloudflare Worker name mismatch by changing repository `wrangler.toml` from `bakery-erp` to `swammarn`; TypeScript, 54 tests, production build, and Wrangler 4.15.2 dry-run pass.
- [x] Fix Cloudflare deployment validation error `Unexpected error: http.createServer is not implemented yet` from `worker.ts:6` by using the explicit non-conflicting `nodejs_compat_v2` plus HTTP server compatibility flags; TypeScript, 54 tests, production build, and Wrangler dry-run pass. Cloudflare retry remains pending.
- [x] Replace the unsupported `cloudflare:node` HTTP server bootstrap in `worker.ts` with a Worker-native fetch adapter for tRPC and asset fallback; preserve Supabase bearer auth, Hyperdrive, storage proxy, and business logic. Added focused Worker tests; TypeScript, 54 tests, production build, and Wrangler dry-run pass.
