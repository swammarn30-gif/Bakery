import { describe, expect, it } from "vitest";
import postgres from "postgres";

describe("Supabase production connection", () => {
  it("connects with a lightweight non-destructive query when configured", async () => {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    if (!connectionString) {
      expect(connectionString).toBeTruthy();
      return;
    }

    const client = postgres(connectionString, { prepare: false, max: 1 });
    try {
      const result = await client`select 1 as ok`;
      expect(result[0]?.ok).toBe(1);
    } finally {
      await client.end({ timeout: 5 });
    }
  }, 30_000);
});

export {};
