
## Live installability verification

The first live release used `/manus-storage/...png` paths that Vercel rewrote to `index.html`, so the browser received HTML instead of PNG icons. The fix uploads separate 192x192 and 512x512 Concept 1 PNGs to public CDN URLs and points the manifest, favicon, and Apple touch icon to those URLs.

On the READY Vercel release `dpl_H3URw1U1Gm4Er6eZ7KwVqC5Sp3j3`, the manifest returns `application/manifest+json`; the 192px URL returns a real 192x192 PNG; and the 512px URL returns a real 512x512 PNG. The live browser reports the manifest link `/manifest.webmanifest` and an activated service worker scoped to `https://bakery-alpha-puce.vercel.app/`. The current browser is not in standalone mode because it has not been installed yet; install-state is expected to remain false until the user chooses Install app from the browser UI.

## Same-origin proxy verification

The final Vercel release `dpl_3QJZb9JgyPFrZsqB2qY6xgaV4wgX` is READY. Live `/api/pwa/icon-192` returns HTTP 200 with `image/png` and a 192x192 PNG; live `/api/pwa/icon-512` returns HTTP 200 with `image/png` and a 512x512 PNG. Browser-side fetch confirms the manifest is HTTP 200, uses `display: standalone` and root scope, both icon endpoints are same-origin and return `image/png`, and the root service worker is `activated` for `https://bakery-alpha-puce.vercel.app/`. The browser session itself remains non-standalone because it has not been installed yet.

## Authentication preservation check

The live page remains on the Administrator dashboard and the browser has the expected Supabase session key `sb-npiifxjxwvxetanhbugk-auth-token`. A direct cookie-only `auth.me` probe returned `json:null` because the app’s tRPC client sends its bearer token from the Supabase session storage rather than relying on a cookie; this probe did not replace the app’s authenticated request path. The visible dashboard and stored session confirm that the PWA changes did not remove the session or alter the application auth flow.
