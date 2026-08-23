import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel deployment configuration", () => {
  it("builds the Vite app into the published static directory", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as {
      buildCommand?: string;
      outputDirectory?: string;
    };
    expect(config.buildCommand).toBe("pnpm build:vercel");
    expect(config.outputDirectory).toBe("dist/public");
  });

  it("keeps API requests out of the SPA fallback rewrite", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as {
      rewrites?: Array<{ source?: string; destination?: string }>;
    };
    const spaRewrite = config.rewrites?.find((rewrite) => rewrite.destination === "/index.html");
    expect(spaRewrite?.source).toContain("api");
    expect(spaRewrite?.source).toContain("?!");
  });

  it("exposes explicit Vercel auth and tRPC serverless entrypoints", () => {
    const authEntrypoint = readFileSync(resolve(process.cwd(), "api/auth/sign-in.ts"), "utf8");
    const trpcEntrypoint = readFileSync(resolve(process.cwd(), "api/trpc/[...path].ts"), "utf8");
    expect(authEntrypoint).toContain("signInWithSupabaseCredentials");
    expect(authEntrypoint).toContain("export default async function handler");
    expect(trpcEntrypoint).toContain("createExpressApp");
    expect(trpcEntrypoint).toContain("export default createExpressApp()");
  });
});
