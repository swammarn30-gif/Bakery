import { describe, expect, it } from "vitest";
import { authenticateSupabaseBearer } from "./supabaseAuth";

describe("Supabase Auth ERP integration", () => {
  it("signs in the approved admin and resolves the ERP admin role", async () => {
    const url = process.env.VITE_SUPABASE_URL!;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;
    const password = process.env.BAKERY_ADMIN_PASSWORD!;
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "content-type": "application/json" },
      body: JSON.stringify({ email: "swammarn30@gmail.com", password }),
    });
    expect(response.ok).toBe(true);
    const tokenBody = await response.json() as { access_token?: string };
    expect(tokenBody.access_token).toBeTruthy();
    const user = await authenticateSupabaseBearer(`Bearer ${tokenBody.access_token}`);
    expect(user?.email).toBe("swammarn30@gmail.com");
    expect(user?.role).toBe("admin");
  }, 20_000);
});

export {};
