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

- [x] Sync the corrected `deploy:worker` package script and current Cloudflare configuration to the connected GitHub repository; verified commits `7526fa6` and `adbe6f8` are on GitHub main.
- [x] Confirm Cloudflare built the updated commit with `pnpm run deploy:worker`; build `c3b6b4ef-0e59-4af3-9bd6-2317bb5b9168` completed successfully.

- [x] Not applicable for this deployment: no unrelated-history rewrite was performed. Normal authenticated synchronization succeeded, the approved final commit `a1a202a` is on `swammarn30-gif/Bakery` `main`, and destructive history replacement is unnecessary and unsafe.
- [x] Verified GitHub `main` is synchronized through normal authenticated pushes, with commits `7526fa6` and `adbe6f8` present.
- [x] Confirm GitHub contains `deploy:worker`; Cloudflare successfully deployed from the synchronized repository.

- [x] Fix Cloudflare Worker runtime error `require_stream` / code 10021 caused by the incompatible Node HTTP adapter by replacing it with a Cloudflare Worker-native fetch entrypoint.
- [x] Rebuild and verify the Cloudflare Worker runtime after replacing the incompatible Node request bridge; the Worker-native deployment completed successfully.

- [x] Audit the connected Cloudflare Worker project `swammarn` and configure its production variables/secrets and Hyperdrive binding for Bakery ERP.
- [x] Validate `swammarn` after secure configuration; Cloudflare deployment succeeded and the live Worker serves the ERP sign-in page.

- [x] Configure the confirmed `swammarn` Worker with secure Supabase/Auth/JWT/runtime secrets and the existing Bakery ERP Hyperdrive binding.
- [x] Deploy `swammarn` after secret configuration and validate the live Worker URL; Supabase login form and application assets are available, while credential-dependent login/database smoke testing remains pending.
- [x] Fix the Cloudflare Workers deploy failure caused by `TypeError: require_streams(...) is not a function` by pinning Wrangler to the known-compatible 4.15.2 release; local build, tests, and dry-run pass.
- [x] Verify the deployed Worker serves the Bakery ERP application and Supabase email/password sign-in screen instead of Cloudflare’s placeholder page.
- [x] Complete production login and smoke-test verification after the Worker route is live: Supabase password authentication returned HTTP 200, the live Worker returned ERP user `swammarn30@gmail.com` with role `admin`, and a combined batched tRPC request returned the protected dashboard data keys `items`, `pendingApprovals`, `purchases`, and `sales`.
- [x] Confirm no temporary admin-provisioning script remains in the repository; the Admin identity is provisioned through secure Supabase configuration and the controlled live auth test reached the ERP admin role.
- [x] Fix Cloudflare Worker name mismatch by changing repository `wrangler.toml` from `bakery-erp` to `swammarn`; TypeScript, 54 tests, production build, and Wrangler 4.15.2 dry-run pass.
- [x] Fix Cloudflare deployment validation error `Unexpected error: http.createServer is not implemented yet` from `worker.ts:6` by using the explicit non-conflicting `nodejs_compat_v2` plus HTTP server compatibility flags; TypeScript, 54 tests, production build, and Wrangler dry-run pass. Cloudflare retry remains pending.
- [x] Replace the unsupported `cloudflare:node` HTTP server bootstrap in `worker.ts` with a Worker-native fetch adapter for tRPC and asset fallback; preserve Supabase bearer auth, Hyperdrive, storage proxy, and business logic. Added focused Worker tests; TypeScript, 54 tests, production build, and Wrangler dry-run pass.
- [x] Fix post-login redirect caused by the homepage’s obsolete `/api/oauth/login` link: the homepage now renders the existing Supabase email/password login screen and stays on the deployed hostname. TypeScript, 54 tests, production build, and Cloudflare build `c3b6b4ef-0e59-4af3-9bd6-2317bb5b9168` pass.
- [x] Diagnose the live Supabase Sign In loop on `https://swammarn.swammarn30.workers.dev/`: the browser session could sign in but the Worker-side bearer bridge read only build-time `process.env`, so `auth.me` returned null. The runtime-binding fix is implemented; redeploy and live retest remain pending.
- [x] Fix the live Supabase login loop by forwarding Cloudflare runtime Supabase secrets/owner identity into bearer authentication and adding explicit timeout/error handling; TypeScript, 54 tests, production build, and Wrangler dry-run pass. Cloudflare build `6aac0864-0315-4ec6-8091-0696b8da6bbd` deployed successfully.
- [x] Diagnose the post-authentication handoff: browser storage contained a valid Supabase access token; the first `auth.me` request returned HTTP 200 with `json:null`, while a later authenticated request returned HTTP 200 with `swammarn30@gmail.com` as ERP `admin`. The evidence identified the ungated initial query race; `useAuth` is now gated on `sessionReady`.
- [x] Add and use narrowly scoped diagnostics for Supabase bearer verification and `auth.me` context failures, excluding token/password values; the controlled request was measured directly and the evidence-based readiness fix was applied.
- [x] Run the controlled live test with the user-provided Admin credentials without storing the password; Supabase session storage was present, the first `auth.me` response was HTTP 200/null, and the subsequent authenticated `auth.me` response was HTTP 200/Admin in 2.7 seconds.
- [x] Fix the verified auth race in `useAuth`: `auth.me` is gated on `sessionReady`, with focused regression coverage. TypeScript, 56 Vitest tests, production build, Wrangler dry-run, Cloudflare deployment version `e9b7da34-093e-49ad-aba1-a1fe33e1344b`, and live Admin/batched dashboard smoke tests pass.
- [x] Configure or restore the Cloudflare GitHub Builds connection for Worker `swammarn`: repository connection `swammarn30-gif/Bakery` and `main` production trigger are active; manual build for commit `a1a202a` succeeded and deployed version `e9b7da34-093e-49ad-aba1-a1fe33e1344b`.
- [x] Keep the production URL `https://swammarn.swammarn30.workers.dev/` unchanged and deploy the latest GitHub `main` code to the existing Cloudflare Worker; live HTTP 200, application shell, deployment version `e9b7da34-093e-49ad-aba1-a1fe33e1344b`, Supabase Admin auth, and protected batched dashboard read pass.
- [x] Reconnect Cloudflare Worker `swammarn` to GitHub repository `swammarn30-gif/Bakery` on branch `main`, preserving `https://swammarn.swammarn30.workers.dev/`; Cloudflare repository connection, production trigger, build, deployment, and live smoke verification all pass.
- [x] Migrate real Production and Packaging ledger data from `swammarn30.netlify.app` for 2026-08-01 through 2026-08-20 into the current Cloudflare ERP: 113 source items created with exact names/types, 880 Production rows and 1,380 Packaging rows imported (2,260 total), date bounds verified, and no duplicate date/department/item keys found.
- [x] Resolve the verified target mapping blocker: after confirmation, 113 source items were created in active Supabase `public.items` with base unit g; 2,260 linked ledger rows were imported and verified. Supabase still reports RLS disabled on ERP tables; no policy changes were made automatically during this migration.
- [x] Correct the approved migration unit model: all 69 Packaging Item Master records now use `pcs`; the 44 Production items remain `g`; the 1,380 Packaging and 880 Production imported rows remain present for 2026-08-01 through 2026-08-20, with numeric quantities unchanged because only Item Master units were corrected.
- [x] Verify live Cloudflare UI against the source website: confirmed Item Master order starts with the source sequence and Production/Packaging data for 2026-08-01 through 2026-08-20 is present; Production raw materials remain g and Packaging materials are pcs.
- [x] Fix the verified live Cloudflare auth/runtime error so Supabase Admin bearer tokens resolve through `auth.me` and protected ERP procedures; full validation, GitHub `main`, Worker `swammarn` deployment, and unchanged production URL retest pass.

- [x] Fix and verify the confirmed mobile Chrome production error `Sign in timed out. Check the production connection and try again.` on `https://swammarn.swammarn30.workers.dev/`; the evidence-backed auth hydration fix is deployed and live sign-in reaches the dashboard.

- [x] Reproduce and eliminate the repeated live production login failure reported after the `a7b1226` deployment; live browser verification confirms authorized sign-in transitions to the dashboard without looping back to Sign in or timing out.

- [x] Re-audit the authenticated legacy Netlify source against the live Cloudflare app; verified 2026-08-01 through 2026-08-20 contains 880 Production and 1,380 Packaging rows, and corrected Item Master/ledger ordering to the source-preserving sequence.
- [x] Re-run live verification after the corrected migration: Cloudflare build succeeded, protected dashboard authentication was previously verified, Supabase confirms the legacy Item Master sequence with Packaging pcs, and the requested ledger range contains 880 Production and 1,380 Packaging rows.

- [x] Reproduce the current live Cloudflare Sign In error with the provided Supabase admin account and capture the actual browser/network/runtime failure: Supabase password exchange was valid, but the frontend mounted-query handoff returned to Sign In until the deterministic reload fix was added.
- [x] Fix the evidence-backed authentication failure, redeploy through GitHub/Cloudflare, and verify that Sign In reaches the protected dashboard without looping or timing out; final live browser test reaches the authenticated dashboard.

- [x] Complete and verify the live Cloudflare Sign In fix: Supabase password exchange returns 200 and the deployed Worker `auth.me` returns the admin ERP user with HTTP 200 after the anon-key fallback.
- [x] Redesign the dashboard shell, navigation placement, and page spacing to follow the authenticated legacy Netlify reference with a dark header, pill navigation, compact content frame, and preserved table/workflow components.
- [x] Verify the redesigned UI on desktop and mobile: desktop/mobile previews pass, the live post-fix sign-in reaches the dashboard with the reference-style header and pill navigation, prior Production/Packaging ledger checks remain valid, and TypeScript/Vitest/build validation passes.

- [x] Measure the current live Sign In timeout and latency across Supabase password exchange, token persistence, Worker `auth.me`, and dashboard hydration.
- [x] Fix the confirmed slow/timeout authentication path with bounded, evidence-backed retries and no unnecessary serial waits; deploy and verify fast live dashboard access.
- [x] Fix Production and Packaging StockPanel item filtering so Production shows only production raw-material items in g and Packaging shows only packaging items in pcs; preserve migrated ledger rows and business formulas.
- [x] Re-run live Production and Packaging smoke tests after the filtering fix.
- [x] Investigate why Aug 20 migrated dailyStock rows are not populating the visible ledger inputs even though the database migration counts are present; fix only the data-display path if confirmed.
- [x] Re-run Aug 20 live data-value verification for Production and Packaging after the visibility investigation.
- [x] Close the initially ambiguous 2026-01-08 through 2026-06-20 request after the user clarified the intended range is 2026-08-01 through 2026-08-20.
- [x] Transform and validate the authenticated legacy export into the current Bakery ERP import format without changing units or formulas.
- [x] Close the superseded June-range import request; the approved Aug 1–20 range was used instead.
- [x] Export legacy Production and Packaging data specifically for 2026-08-01 through 2026-08-20 after user date-range confirmation.
- [x] Transform, import, and verify the confirmed Aug 1–20 Production and Packaging records in the current ERP without duplicating existing rows; corrected 24 source-parity differences and confirmed 2,260 current rows match the export row-by-row.
- [x] Keep the existing Production/Packaging page date selectors and date-specific spreadsheet tables as-is; the clarified requirement was separate exports rather than a report-page redesign.
- [x] Update Excel export so Production Daily and Packaging Daily are separate department-specific files for the selected date range.
- [x] Add export-helper tests, full-suite verification, production build, and desktop/mobile preview checks for the separate export controls.
- [x] Add separate export actions/files for Production and Packaging so each export contains only its own department data for the selected date range.
- [x] Add regression coverage proving Production export excludes Packaging rows and Packaging export excludes Production rows.
- [x] Push the verified separate Production/Packaging export change to GitHub main.
- [x] Deploy the pushed commit to the existing Cloudflare Worker production hosting and verify the live URL responds with the updated build.
- [x] Redesign separate Production and Packaging export workbooks so each selected date is a distinct column, with Item and Field retained at the left and stock values pivoted under each date.
- [x] Add regression tests for date-column ordering, date values, formula rows, and department isolation in the revised export layout; full suite remains 70 tests passing.
- [x] Push the verified date-as-columns Production/Packaging export change to GitHub main if it is not already present.
- [x] Deploy the date-column export build to Cloudflare production and verify the live Worker URL.
- [x] Generate three alternative Excel examples from the real 2026-08-01 through 2026-08-20 Production and Packaging data for user selection.
- [x] Do not modify the live export layout until the user selects one of the three examples; the user selected Example 2.
- [x] Adopt Example 2 grouped-date spreadsheet tables for Production and Packaging in the application UI/export flow.
- [x] Add left-corner menu navigation and reduce the current crowded page-switching controls while preserving existing routes.
- [x] Add a system-wide Master Date default used by all relevant pages, with per-page date override still available where needed.
- [x] Implement automatic carry-forward: each day's Opening follows the previous day's Closing, and editing an earlier day recalculates later days through the existing stock save cascade.
- [x] Replace manual row-by-row save with 800ms debounced autosave and visible save status.
- [x] Remove Opening Proposal from the main workflow and support date-specific opening edits from Item Dashboard.
- [x] Add regression coverage through the existing stock/export tests; TypeScript, full Vitest suite (70 tests), production build, and desktop/mobile preview checks pass.
- [x] Push the latest Master Date, Example 2 grouped-date export, left-corner menu, carry-forward, autosave, and Item Dashboard opening changes to GitHub main, deploy to Cloudflare, and verify the live Worker URL.
- [x] Fix Excel exports so downloaded Production and Packaging files include populated data rows, not headers only.
- [x] Redesign Reports to select one Item and a Date Range instead of rendering an oversized all-date table.
- [x] Remove the nonessential summary/description block above operational tables and make tables the primary mobile view.
- [x] Move the compact menu into the B branding area, reduce Name/Item column width, and verify mobile fit.
- [x] Split Order Table and BOM into separate pages/navigation destinations.
- [x] Restrict Order Table Choose Item options to items available in Sale Table only.
- [x] Add regression tests and responsive verification for all reported fixes before deployment.
- [x] Sync checkpoint 24819382 to GitHub main and deploy the existing swammarn Cloudflare Worker; verify the unchanged live URL after deployment.
- [x] Measure and optimize slow login flow across Supabase sign-in, Cloudflare Worker auth.me, and dashboard hydration without weakening security.
- [x] Measure and optimize Dashboard data loading so summary and operational records appear faster without changing ERP formulas or workflows.
- [x] Measure and optimize data loading across Production, Packaging, Purchase, Sale, Item Master, Orders/BOM, Reports, and Approvals without changing formulas or workflows.
- [x] Add visible loading animation and skeleton states for fresh data loads and refreshes across data-driven ERP pages.
- [x] Sync checkpoint 51ead928 to GitHub main, deploy Cloudflare Worker swammarn, and verify the live URL with the new loading feedback.
- [x] Fix mobile login stuck at Signing in after the latest deployment; verify auth.me, dashboard access, and timeout handling without weakening security.
- [x] Verify latest login-fix commit is on GitHub main, confirm Cloudflare Worker hosting is deployed, and validate the live URL.
- [x] Identify and document the confirmed root cause of the live Sign In flow stuck at Signing in using runtime, network, client, Worker, and Supabase evidence.
- [x] Fix the production Login flow so it no longer hangs or becomes unusably slow; keep authentication secure, and only consider removing it after explicit confirmation if the fix fails.
- [x] Diagnose and fix the remaining mobile `Signing in…` hang at the exact Supabase password-request or client network layer; verify live sign-in without removing authentication.
- [x] Resolve the still-unverified mobile Sign In hang with captured production browser evidence, or document the exact blocker instead of claiming success.
- [x] Replace mobile Supabase JS sign-in with a direct bounded Auth REST flow, preserve secure session handling, add regression tests, and verify live deployment.
- [x] Resolve the confirmed mobile Supabase Auth REST timeout shown in the latest screenshot, verify the production browser login end to end, and keep authentication enabled.
- [x] Complete an end-to-end audit of frontend, Supabase, tRPC, Worker/server, database, environment, build, and deployment code to identify the mobile Login timeout root cause.
- [x] Redesign the confirmed ledger workflow: remove excess shell space, match the reference spreadsheet table, normalize `400.000` display, keep Issued manually editable after auto-fill, restore Order-to-Issued automation, and restore cascading Closing-to-Opening carry-forward; added synthesized daily rows for unsaved order-driven materials and 3 formatting regression tests.
- [x] Sync the verified latest ERP overhaul to GitHub `main` and confirm the connected Cloudflare build/deployment pipeline receives the new commit; Cloudflare Build history confirmed `main / 6add58b` succeeded. Later Vercel hosting became the selected target.
- [x] Netlify hosting exploration superseded by the user’s later Vercel hosting decision; no Netlify deployment was performed.
- [x] Adapt the latest Bakery ERP source for Vercel-compatible build, SPA routing, serverless API/auth behavior, and Supabase environment configuration; TypeScript, 83 Vitest tests, and Vercel production build pass; synchronized as GitHub commit `0308b73`.
- [x] Diagnose and fix Vercel production sign-in error `Unable to reach sign-in service`; corrected the Vercel Transaction Pooler database URL, redeployed, and verified live administrator login plus Dashboard data.
- [x] Replace the Vercel `SUPABASE_DATABASE_URL` placeholder with the authorized Transaction Pooler URI, redeploy, and verify login plus database-backed auth.me.
- [x] Replace the Vercel `SUPABASE_DATABASE_URL` placeholder with the authorized Transaction Pooler URI, redeploy, and verify login plus database-backed auth.me.
- [x] Diagnose and repair the live Vercel Auto Carry Forward failure so Closing flows into the next date’s Opening and earlier edits cascade through later dates in Production and Packaging.
- [x] Diagnose and repair the live Issued manual-edit failure so Auto Issued can be overridden, saved, and retained without being overwritten by later refreshes.

- [x] Fix live daily-ledger Opening derivation so an unsaved or newly selected date receives the prior persisted Closing per item, while preserving explicit saved Openings where appropriate.
- [x] Fix StockPanel draft synchronization so server-cascaded Opening values and persisted manualIssued flags cannot be hidden or overwritten by stale drafts after save/refetch/date changes.
- [x] Add regression tests for Opening carry-forward across existing and unsaved dates, early-date cascade, and manual Issued override persistence through save/list mapping.
- [x] Re-run TypeScript, full Vitest suite, production build, and live read-only verification; then checkpoint and push the verified fix to GitHub main for Vercel redeployment.

- [x] Delete all approved transactional data while preserving the admin account and Item Master, then verify counts and application access.

- [x] Make Production and Packaging daily-ledger pages use the compact first-screenshot shell without the extra Dashboard/Workflows/Breadcrumb/blank space.
- [x] Lock Opening inputs in the daily ledger and route date-specific Opening edits through Item Master only, while preserving automatic carry-forward and cascade behavior.
- [x] Add regression coverage for locked ledger Opening behavior and run TypeScript, tests, production build, and mobile/desktop visual verification.

- [x] Render zero-valued Production and Packaging ledger quantities as blank without changing stored values or formulas.
- [x] Add blank-zero formatting regression coverage, run TypeScript/tests/build, verify the live UI, and sync the release to GitHub/Vercel.

- [x] Copy only source Production and Packaging ledger data from 2026-08-01 through 2026-08-20; include Opening only for 2026-08-01 and include In, Issued, Return, and Damage for every date.
- [x] Validate item mapping, import the real source rows without fabricated values, verify automatic Opening carry-forward, and report any missing or ambiguous source data.

- [x] Audit every imported Production and Packaging movement row from 2026-08-01 through 2026-08-20 against the source site and identify negative Closing values.
- [x] Verify each negative Closing with the ledger formula and correct only confirmed import or mapping mismatches; re-run counts and live checks.

- [x] Re-audit the reported negative Closing values as a confirmed defect; trace source field semantics, destination formulas, and automatic carry-forward rather than assuming the source values are correct.
- [x] Reproduce the defect with exact Production and Packaging rows, correct the proven logic or mapping, and reverify all affected dates before reporting completion.

- [x] Separate Report UI/data flow from Export/Import UI/data transfer flow.
- [x] Add item selector and date-range report table showing Opening, In, Issued, Return, Damage, Used, Closing, and Note by date.
- [x] Preserve the approved Closing and Used formulas in the new item-by-date report.
- [x] Add regression tests and verify the report on desktop and mobile layouts.
- [x] Correct all Production and Packaging calculation paths to use Closing = Opening + In + Return - Issued and Used = Issued - Return - Damage, including carry-forward and reports.
- [x] Preserve imported Issued quantities as manualIssued=true so stock.list and carry-forward do not replace source values with BOM auto-issued quantities.

- [x] Replace only Production and Packaging ledger rows dated 2026-08-01 through 2026-08-20 from the verified source dataset.
- [x] Import Opening only for 2026-08-01; import In, Issued, Return, and Damage for every requested date; leave Used and Closing derived.
- [x] Verify all expected rows and In values, manual Issued flags, formulas, and automatic Opening carry-forward after replacement.

- [x] Reconcile every source In value against the corresponding destination daily ledger row through the authenticated Website UI, without direct Supabase access or writes. Date-by-date runners found zero missing-row errors and source movements were persisted.
- [x] Verify the corrected In values through the router/UI path without deleting data until the defect is proven. Final Production and Packaging Report histories confirm representative In, Issued, Return, Damage, Used, and Closing sequences under the approved formula.

- [x] Use the source and destination website UIs only for the confirmed Production and Packaging data correction; do not use direct Supabase writes. Verified source movements were applied through authenticated Website UI inputs and native autosave paths only.
- [x] Inspect, delete, re-enter, and verify the confirmed 2026-08-01 to 2026-08-20 ledger rows through the website UI. The completed approved scope additionally extends Packaging through Aug 21.

- [x] Correct the website-only replacement scope to Production through 2026-08-09 and Packaging through 2026-08-21. Every date was executed one at a time through the authenticated destination Website UI and each runner reported zero missing-row errors.
- [x] Verify Aug 1 Opening and later In, Issued, Return, and Damage entries for both revised ranges through the website UI. Source Aug 1/Aug 2 Production samples, final-date persistence reruns, and Production/Packaging Report histories were verified; later Opening follows the approved automatic formula.
- [x] Do not add the proposed protected, admin-only Website UI clear action. The user explicitly declined this destructive feature on 2026-08-23; no delete capability was implemented.
- [x] Diagnose and correct the live Vercel runtime timeout and missing Supabase runtime-configuration path without changing ledger data directly. Reused existing ERP users instead of issuing an upsert on every bearer-authenticated request, added a short-lived authenticated-user cache, indexed stock-list BOM issuance once per request, and deployed GitHub commit d5d4358 to Vercel production.
- [x] Verify live Vercel sign-in plus Production and Packaging ledger date changes load reliably before resuming Website-only data correction. Live Administrator login loaded; Production and Packaging each returned their full data rows after Aug 1 → Aug 2 native date transitions, with no browser-console errors or recent Vercel runtime errors.
- [x] Add the user-approved source Packaging item `16×24 pcs` through the destination Item Master Website UI, then verify it is available only for Packaging Aug 21 ledger entry. Created as an active Packaging material with pcs base unit; destination Dashboard item count increased from 114 to 115 after refresh.
- [x] Fix automatic carry-forward so correcting a prior day through the Website UI updates later-day automatic Opening values to the prior Closing, then verify this live before resuming later-date correction. Verified live after the Aug 1 S Closing of 737 became Aug 2 S Opening 737; all Packaging Aug 2 source rows then had zero Opening mismatches.
- [x] Fix the daily-ledger multi-field autosave path so a Website UI row edit persists the complete latest draft rather than reverting on a date reload. Deployed GitHub commit b204161 with a complete-draft ref-backed save queue and regression test; live Packaging Aug 1 and Aug 2 data persisted across a clean deployment reload.

- [x] Diagnose and fix the mobile Packaging ledger remaining on the loading skeleton after selecting a date, and verify that real rows render reliably on the live Vercel site. Commit e56d5c2 is deployed on Vercel; live Packaging loads and the Aug 2 to Aug 22 date transition resolved to real rows without the false empty-item state.

- [x] Inspect the user-provided TikTok reference and adapt its lower mobile navigation pattern for Bakery ERP without changing ledger workflows. Mobile navigation now provides liquid-style Home, Production, Packaging, Report, and More actions; desktop navigation remains unchanged.

- [x] Update Report so one selected item displays one row per date in the chosen range with Date, Opening, In, Issued, Return, Damage, Used, Closing, and Note columns, plus footer totals for In, Damage, and Used. Live Production flour Aug 1–9 verification showed In 320000, Damage 1, and Used 331871.

- [x] Remove both upper navigation bars on mobile—the `B Bakery ERP` brand header and the `B / menu / current page` bar—while retaining the liquid bottom navigation and all desktop navigation behavior. Authenticated 375px live verification confirmed both upper bars are hidden, the Packaging ledger and bottom navigation remain visible, More opens secondary workflows, and the desktop header/menu remain available.

- [x] Change the active mobile bottom-navigation circle to Bakery ERP’s amber/gold brand color, with a readable high-contrast active icon and label. Live authenticated mobile verification measured amber active-circle color `oklch(0.828 0.189 84.429)` with a dark slate icon and confirmed the Packaging ledger plus More navigation remain usable.

- [x] Verify the reported live mobile Issued manual-edit behavior without altering business data: the first live Packaging Issued input is enabled, writable, and decimal-capable; its change handler schedules an 800ms autosave with `manualIssued: true`, and 31 focused calculation tests for manual Issued preservation pass. No defect was reproduced during read-only live verification.

- [x] Superseded: do not delete Production rows after 2026-08-09. The user clarified that daily records and automatic Opening values must remain.
- [x] Clear only In, Issued, Return, and Damage for all Production dates after 2026-08-09 through the authenticated Website UI autosave path; preserve Opening, keep Packaging unchanged, and verify the cleared movements by date. Independent website-UI checks found zero non-zero movement rows on every Production date from 2026-08-10 through 2026-08-22; 41 automatic Opening values remain available on each checked date.

- [x] Generate separate Website-UI Excel exports for Production and Packaging Opening/Closing histories, then audit formula correctness and Closing-to-next-day-Opening continuity across every exported date. Final ready-state Aug 1–22 exports contain 880 Production and 1,407 Packaging ledger records; all 2,287 formula checks and all 2,173 Closing-to-next-day-Opening checks passed with zero exceptions.
- [x] Repair the discovered Website-UI history-export readiness defect: the Aug 1–22 Production and Packaging workbooks initially contained headers/items but blank data values because the transfer-page range queries were still loading. The Export buttons now remain disabled until the relevant department data and Item Master are ready; focused tests, TypeScript, and Vercel build pass.
- [x] Push and deploy the verified export-readiness fix to GitHub and Vercel, then confirm the live UI blocks premature downloads and exports populated history workbooks after loading completes. GitHub commit `c68a1f2` is live in Vercel deployment `dpl_86F7midfyTJvvGKf5MujeCi7p9PB` (READY); the live Aug 1–22 page reports both export controls ready only after its data load completed.

- [x] Replace the mobile Home/Overview bottom-navigation destination with Purchase while preserving desktop navigation.
- [x] Convert Item Master from card/list presentation to a horizontally scrollable, directly editable spreadsheet-style table with a Minimum Stock field.
- [x] Add a Low Stock page showing items whose current calculated stock is at or below their saved Minimum Stock, with item, unit, current stock, minimum stock, shortfall, and status.
- [x] Remove from More every workflow already represented by the liquid mobile primary navigation, leaving only secondary pages.
- [x] Add regression coverage, responsive verification, GitHub sync, and Vercel production deployment for the requested inventory-navigation changes. Low-stock calculations and More-menu filtering have 5 focused passing tests; TypeScript and Vercel build pass; GitHub commit `a08c6ed` is live in Vercel deployment `dpl_9Ykr2aA2KhMCQUzx6S7Cp7hvKjCu` (READY).

- [x] Replace manual Minimum Stock thresholding in Low Stock with a department-specific dynamic threshold: from the first recorded ledger date through the item’s latest date, calculate average daily Used and mark Low Stock only when Current Closing is below Average Used × 3. The Low Stock table now shows Current Closing, Avg Used, 3-day threshold, and Shortfall; focused tests, TypeScript, Vercel build, GitHub commit `e66d5f9`, and Vercel deployment `dpl_J1qQRbokph3Q3e4r2HRVUwuAFcoi` are verified READY.

- [x] Generate one mobile Bakery ERP visual mockup showing the requested iPhone-inspired Liquid Glass direction while retaining the spreadsheet-style Production/Packaging table concept.

- [x] Regenerate the approved Liquid Glass mobile Bakery ERP mockup with all item-row icons removed, retaining text-only Item and unit cells plus the glass spreadsheet presentation.

- [x] Add an Item-name search bar above Production and Packaging Daily Ledger tables that filters only the active department and selected date’s table rows.
- [x] Add a Liquid Glass transfer control beside that search bar with Import and Export actions scoped only to the active Daily Ledger department and selected date.
- [x] Add regression coverage, responsive validation, GitHub sync, and Vercel deployment for the Daily Ledger search and date-scoped transfer controls. Seven focused search/export tests, TypeScript, and Vercel build pass; GitHub commit `8b9609b` is deployed in Vercel deployment `dpl_7HZiobxjQRNeNzKi2r42ZPxPEZjy` (READY).

- [x] Diagnose and repair the reported live Vercel Supabase Sign In failure before proceeding with the approved Liquid Glass UI redesign. Vercel production logs identified an ESM module-resolution crash in `shared/lowStock`; GitHub commit `2852cb7` / deployment `dpl_Hq49azB8DDJhSpTosbkUmq8M1k6c` is READY, and a clean production password-sign-in test reached the Administrator dashboard.
- [x] After stable live sign-in is verified, apply the user-approved icon-free iPhone-inspired Liquid Glass style to the mobile ERP shell while preserving the spreadsheet-style Production and Packaging ledgers. The live Production table, date-scoped search/import/export controls, desktop shell, formulas, autosave, and mobile primary-navigation behavior remain intact; GitHub commit `61fae9d` is Vercel deployment `dpl_7Z12RXzuL7qu4yGjzT8uCb4Jxsa7` (READY).

- [x] Use selected Liquid Glass PWA icon Concept 1 (Bread + Wheat) in the installable app manifest and favicon metadata; live Vercel manifest verification passed.
- [x] Repair Date Range Export/Import so Production and Packaging files contain the correct rows, dates, departments, and derived ledger values; grouped workbooks now round-trip through a department-aware parser and sequential carry-forward export.
- [x] Add a Report-page Export button that exports the currently selected item, department, and date range using the visible report columns and totals; live Report page verification passed.

- [x] Add Purchase item-name search and separate Production/Packaging purchase workflows while preserving quantity-unit conversion, weighted costing, and purchase history behavior; live Purchase verification passed.
- [x] Refine the overall Liquid Glass treatment across the ERP shell without adding the explicitly excluded total summary bar; spreadsheet-first ledgers and existing formulas remain preserved.
- [x] Add PWA manifest, service worker, selected icon metadata, focused regression tests, TypeScript/build validation, GitHub sync, Vercel deployment, and live smoke verification. GitHub commit `e6cf03f` is deployed as Vercel `dpl_7deyk3eDhZJqGri8Wdqszb2qM4o4` (READY); 46 focused tests passed.

- [ ] Diagnose why the live Vercel app offers only a browser shortcut instead of an installable PWA, including service-worker scope/registration, manifest criteria, icon delivery, and browser installability.
- [ ] Fix the PWA installability path without intercepting Supabase authentication or tRPC/API requests, then verify the browser exposes an Install app action on the live app.
- [ ] Add regression coverage, build checks, deployment verification, and a checkpoint for the PWA installability fix.
