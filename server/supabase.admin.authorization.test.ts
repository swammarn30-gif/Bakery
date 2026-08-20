import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn(async () => true) }));

const { authenticateSupabaseBearer } = await import("./supabaseAuth");
const { appRouter } = await import("./routers");

describe("Supabase admin authorization", () => {
  it("allows the Supabase-authenticated admin and denies a non-admin role", async () => {
    const url = process.env.VITE_SUPABASE_URL!;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;
    const password = process.env.BAKERY_ADMIN_PASSWORD!;
    const tokenResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "content-type": "application/json" },
      body: JSON.stringify({ email: "swammarn30@gmail.com", password }),
    });
    const tokenBody = await tokenResponse.json() as { access_token: string };
    const adminUser = await authenticateSupabaseBearer(`Bearer ${tokenBody.access_token}`);
    expect(adminUser?.role).toBe("admin");
    const baseContext = { user: adminUser, req: {} as never, res: {} as never };
    await expect(appRouter.createCaller(baseContext).system.notifyOwner({ title: "Auth test", content: "Admin authorization test" })).resolves.toEqual({ success: true });
    await expect(appRouter.createCaller({ ...baseContext, user: adminUser && { ...adminUser, role: "user" } }).system.notifyOwner({ title: "Auth test", content: "Forbidden test" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  }, 20_000);
});

export {};
