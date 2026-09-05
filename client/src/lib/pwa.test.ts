import { describe, expect, it } from "vitest";
import { bakeryPwaManifest, selectedPwaIcon512Url, selectedPwaIconUrl } from "./pwa";

describe("Bakery ERP PWA metadata", () => {
  it("uses the selected Bread + Wheat icon at both install sizes", () => {
    expect(selectedPwaIconUrl).toBe("https://files.manuscdn.com/user_upload_by_module/session_file/310519663502655784/insgTjtUZpLvhhBE.png");
    expect(selectedPwaIcon512Url).toBe("https://files.manuscdn.com/user_upload_by_module/session_file/310519663502655784/HWoTzaPseshKFZgg.png");
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
