import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const getUserByOpenId = vi.fn();
const upsertUser = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { getUser } })),
}));

vi.mock("./db.js", () => ({
  getUserByOpenId,
  upsertUser,
}));

describe("authenticateSupabaseBearer", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    getUser.mockResolvedValue({ data: { user: { id: "admin-id", email: "admin@example.com", user_metadata: {} } }, error: null });
    getUserByOpenId.mockResolvedValue({ id: 1, openId: "admin-id", email: "admin@example.com", name: "Admin", loginMethod: "supabase-password", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });
  });

  it("reuses an existing ERP user without an upsert write and caches the repeated bearer token", async () => {
    const { authenticateSupabaseBearer } = await import("./supabaseAuth.js");

    await expect(authenticateSupabaseBearer("Bearer stable-token")).resolves.toMatchObject({ openId: "admin-id", role: "admin" });
    await expect(authenticateSupabaseBearer("Bearer stable-token")).resolves.toMatchObject({ openId: "admin-id", role: "admin" });

    expect(upsertUser).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getUserByOpenId).toHaveBeenCalledTimes(1);
  });
});
