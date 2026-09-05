export const selectedPwaIconUrl = "/manus-storage/bakery-pwa-icon-concept-1-192_aa2cf00a.png";
export const selectedPwaIcon512Url = "/manus-storage/bakery-pwa-icon-concept-1-512_f84085c2.png";

export const bakeryPwaManifest = {
  name: "Bakery ERP",
  short_name: "Bakery ERP",
  description: "Mobile-first bakery production, packaging, purchasing, and stock control.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait-primary",
  theme_color: "#0d172a",
  background_color: "#eef6ff",
  icons: [
    { src: selectedPwaIconUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: selectedPwaIcon512Url, sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
} as const;

export function registerPwaServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js").catch(error => {
    console.warn("[PWA] Service worker registration failed", error);
  });
}
