import { describe, expect, it } from "vitest";
import { bakeryPwaManifest, selectedPwaIcon512Url, selectedPwaIconUrl } from "./pwa";

describe("Bakery ERP PWA metadata", () => {
  it("uses the selected Bread + Wheat icon at both install sizes", () => {
    expect(selectedPwaIconUrl).toBe("/manus-storage/bakery-pwa-icon-concept-1-192_aa2cf00a.png");
    expect(selectedPwaIcon512Url).toBe("/manus-storage/bakery-pwa-icon-concept-1-512_f84085c2.png");
    expect(bakeryPwaManifest.display).toBe("standalone");
    expect(bakeryPwaManifest.icons).toEqual([
      { src: selectedPwaIconUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: selectedPwaIcon512Url, sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ]);
  });

  it("keeps the mobile ERP app scoped to the root route", () => {
    expect(bakeryPwaManifest.start_url).toBe("/");
    expect(bakeryPwaManifest.scope).toBe("/");
    expect(bakeryPwaManifest.orientation).toBe("portrait-primary");
  });
});
