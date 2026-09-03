import { describe, expect, it } from "vitest";
import { bakeryPwaManifest, selectedPwaIconUrl } from "./pwa";

describe("Bakery ERP PWA metadata", () => {
  it("uses the selected Bread + Wheat icon for both install sizes", () => {
    expect(selectedPwaIconUrl).toBe("/manus-storage/bakery-pwa-icon-concept-1_29308bd3.png");
    expect(bakeryPwaManifest.display).toBe("standalone");
    expect(bakeryPwaManifest.icons).toHaveLength(2);
    expect(bakeryPwaManifest.icons.every(icon => icon.src === selectedPwaIconUrl && icon.type === "image/png")).toBe(true);
  });

  it("keeps the mobile ERP app scoped to the root route", () => {
    expect(bakeryPwaManifest.start_url).toBe("/");
    expect(bakeryPwaManifest.scope).toBe("/");
    expect(bakeryPwaManifest.orientation).toBe("portrait-primary");
  });
});
