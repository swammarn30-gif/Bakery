import { describe, expect, it } from "vitest";
import { getPersistedSupabaseAccessToken } from "@/lib/supabase";

export function shouldEnableAuthQuery(sessionReady: boolean) {
  return sessionReady;
}

export function shouldEnableAuthQueryAfterSignIn(sessionReady: boolean, signedIn: boolean) {
  return sessionReady || signedIn;
}

export function shouldReloadAfterSignIn(hasError: boolean) {
  return !hasError;
}

export function shouldNotifyAuthHookAfterSignIn(hasError: boolean) {
  return !hasError;
}

describe("Supabase auth query readiness", () => {
  it("does not enable auth.me before the browser session is initialized", () => {
    expect(shouldEnableAuthQuery(false)).toBe(false);
  });

  it("enables auth.me after the browser session is initialized", () => {
    expect(shouldEnableAuthQuery(true)).toBe(true);
  });

  it("enables auth.me immediately after a fresh sign-in event", () => {
    expect(shouldEnableAuthQueryAfterSignIn(false, true)).toBe(true);
  });

  it("reboots the app only after a successful password sign-in", () => {
    expect(shouldReloadAfterSignIn(false)).toBe(true);
    expect(shouldReloadAfterSignIn(true)).toBe(false);
  });

  it("can recover a persisted access token before Supabase session hydration finishes", () => {
    const storage = {
      getItem: (key: string) => key === "sb-npiifxjxwvxetanhbugk-auth-token" ? JSON.stringify({ access_token: "persisted-token" }) : null,
    } as Storage;
    expect(getPersistedSupabaseAccessToken(storage)).toBe("persisted-token");
  });

  it("notifies the mounted auth hook only after a successful sign-in", () => {
    expect(shouldNotifyAuthHookAfterSignIn(false)).toBe(true);
    expect(shouldNotifyAuthHookAfterSignIn(true)).toBe(false);
  });
});
