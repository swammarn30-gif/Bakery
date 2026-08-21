import { describe, expect, it } from "vitest";
import { getPersistedSupabaseAccessToken } from "./supabase";

describe("getPersistedSupabaseAccessToken", () => {
  it("returns a valid non-expiring token", () => {
    const storage = new Map<string, string>([["sb-npiifxjxwvxetanhbugk-auth-token", JSON.stringify({ access_token: "valid-token" })]]);
    const fakeStorage = { getItem: (key: string) => storage.get(key) ?? null } as Storage;
    expect(getPersistedSupabaseAccessToken(fakeStorage)).toBe("valid-token");
  });

  it("ignores an expired token so Supabase can refresh the session", () => {
    const storage = new Map<string, string>([["sb-npiifxjxwvxetanhbugk-auth-token", JSON.stringify({ access_token: "expired-token", expires_at: Math.floor(Date.now() / 1000) - 1 })]]);
    const fakeStorage = { getItem: (key: string) => storage.get(key) ?? null } as Storage;
    expect(getPersistedSupabaseAccessToken(fakeStorage)).toBeNull();
  });
});
