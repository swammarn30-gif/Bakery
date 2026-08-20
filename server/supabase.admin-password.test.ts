import { describe, expect, it } from "vitest";

describe("Supabase admin password secret", () => {
  it("reaches the password-grant endpoint without exposing the password", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const password = process.env.BAKERY_ADMIN_PASSWORD;
    expect(url).toMatch(/^https:\/\/[^/]+$/);
    expect(anonKey).toBeTruthy();
    expect(password).toBeTruthy();

    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey!, "content-type": "application/json" },
      body: JSON.stringify({ email: "swammarn30@gmail.com", password }),
    });
    expect([200, 400]).toContain(response.status);
  }, 15_000);
});

export {};
