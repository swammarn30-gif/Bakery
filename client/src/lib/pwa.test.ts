import { describe, expect, it } from "vitest";
import { bakeryPwaManifest, selectedPwaIcon512Url, selectedPwaIconUrl } from "./pwa";

describe("Bakery ERP PWA metadata", () => {
  it("uses same-origin selected Bread + Wheat icon endpoints at both install sizes", () => {
    expect(selectedPwaIconUrl).toBe("/api/pwa/icon-192");
    expect(selectedPwaIcon512Url).toBe("/api/pwa/icon-512");
    expect(bakeryPwaManifest.id).toBe("/");
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
