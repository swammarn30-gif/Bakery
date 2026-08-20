import { describe, expect, it } from "vitest";

describe("Supabase Auth secrets", () => {
  it("accepts the configured project URL and keys", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url).toMatch(/^https:\/\/[^/]+$/);
    expect(anonKey).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();

    const settingsResponse = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey! },
    });
    expect(settingsResponse.ok).toBe(true);

    const usersResponse = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    expect(usersResponse.ok).toBe(true);
  }, 15_000);
});

export {};
