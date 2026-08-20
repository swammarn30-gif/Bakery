import { describe, expect, it } from "vitest";

export function shouldEnableAuthQuery(sessionReady: boolean) {
  return sessionReady;
}

export function shouldReloadAfterSignIn(hasError: boolean) {
  return !hasError;
}

describe("Supabase auth query readiness", () => {
  it("does not enable auth.me before the browser session is initialized", () => {
    expect(shouldEnableAuthQuery(false)).toBe(false);
  });

  it("enables auth.me after the browser session is initialized", () => {
    expect(shouldEnableAuthQuery(true)).toBe(true);
  });

  it("reboots the app only after a successful password sign-in", () => {
    expect(shouldReloadAfterSignIn(false)).toBe(true);
    expect(shouldReloadAfterSignIn(true)).toBe(false);
  });
});
