import { afterEach, describe, expect, it, vi } from "vitest";
import { signInWithSupabaseCredentials } from "./passwordAuthCore";

describe("Node-safe Supabase password auth core", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("rejects missing server configuration before making a network call", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await signInWithSupabaseCredentials({ email: "user@example.com", password: "secret" }, {
      supabaseUrl: "",
      anonKey: "",
    });
    expect(result.status).toBe(503);
    expect(JSON.parse(result.body)).toEqual({ error: "Supabase Auth is not configured." });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects malformed credentials", async () => {
    const result = await signInWithSupabaseCredentials({ email: "", password: "" }, {
      supabaseUrl: "https://supabase.example",
      anonKey: "anon-key",
    });
    expect(result.status).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: "Email and password are required." });
  });

  it("forwards a successful Supabase token response", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "access", refresh_token: "refresh" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const result = await signInWithSupabaseCredentials({ email: " user@example.com ", password: "secret" }, {
      supabaseUrl: "https://supabase.example",
      anonKey: "anon-key",
    });
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toMatchObject({ access_token: "access", refresh_token: "refresh" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://supabase.example/auth/v1/token?grant_type=password",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ email: "user@example.com", password: "secret" }) }),
    );
  });

  it("returns a bounded timeout error when Supabase does not respond", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      }),
    );
    const result = await signInWithSupabaseCredentials({ email: "user@example.com", password: "secret" }, {
      supabaseUrl: "https://supabase.example",
      anonKey: "anon-key",
    });
    expect(result.status).toBe(504);
    expect(JSON.parse(result.body).error).toContain("timed out");
  }, 20_000);
});
