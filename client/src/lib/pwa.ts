export const selectedPwaIconUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663502655784/insgTjtUZpLvhhBE.png";
export const selectedPwaIcon512Url = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663502655784/HWoTzaPseshKFZgg.png";

export const bakeryPwaManifest = {
  id: "/",
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
  void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(error => {
    console.warn("[PWA] Service worker registration failed", error);
  });
}
