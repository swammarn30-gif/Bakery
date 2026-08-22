import { describe, expect, it, vi } from "vitest";
import { signInWithPasswordRetry } from "./DashboardLayout";

describe("signInWithPasswordRetry", () => {
  it("retries once after a transient timeout", async () => {
    vi.useFakeTimers();
    const signIn = vi.fn()
      .mockImplementationOnce(() => new Promise<never>(() => undefined))
      .mockResolvedValueOnce({ error: null });
    const resultPromise = signInWithPasswordRetry(signIn);
    await vi.advanceTimersByTimeAsync(30_000);
    await expect(resultPromise).resolves.toEqual({ error: null });
    expect(signIn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("preserves the successful Supabase session payload", async () => {
    const session = { access_token: "token" };
    await expect(signInWithPasswordRetry(async () => ({ error: null, data: { session } }))).resolves.toEqual({ error: null, data: { session } });
  });

  it("fails after two bounded attempts", async () => {
    vi.useFakeTimers();
    const signIn = vi.fn().mockImplementation(() => new Promise<never>(() => undefined));
    const resultPromise = signInWithPasswordRetry(signIn);
    const rejection = expect(resultPromise).rejects.toThrow("Sign in timed out");
    await vi.advanceTimersByTimeAsync(60_000);
    await rejection;
    expect(signIn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
