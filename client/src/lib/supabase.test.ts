import { describe, expect, it } from "vitest";
import { getPersistedSupabaseAccessToken, signInWithPasswordRest } from "./supabase";

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

describe("signInWithPasswordRest", () => {
  it("returns the session from a successful Auth response", async () => {
    const result = await signInWithPasswordRest(" user@example.com ", "secret", 1000, async (_input, init) => {
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ email: "user@example.com", password: "secret" }));
      return new Response(JSON.stringify({ access_token: "access", refresh_token: "refresh", expires_in: 3600 }), { status: 200 });
    });
    expect(result.error).toBeNull();
    expect(result.data?.access_token).toBe("access");
  });

  it("returns Supabase error text for invalid credentials", async () => {
    const result = await signInWithPasswordRest("user@example.com", "wrong", 1000, async () => new Response(JSON.stringify({ error_description: "Invalid login credentials" }), { status: 400 }));
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Invalid login credentials");
  });

  it("returns a bounded timeout error when Auth does not respond", async () => {
    const result = await signInWithPasswordRest("user@example.com", "secret", 5, async (_input, init) => await new Promise((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))));
    expect(result.data).toBeNull();
    expect(result.error?.message).toContain("timed out");
  });
});
