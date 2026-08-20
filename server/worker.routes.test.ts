import { describe, expect, it } from "vitest";
import { createWorkerFetch } from "../worker-handler";

function makeAssets() {
  const requests: string[] = [];
  return {
    requests,
    binding: {
      fetch: async (request: Request) => {
        requests.push(new URL(request.url).pathname);
        return new Response(request.url.endsWith("/index.html") ? "index" : "missing", {
          status: request.url.endsWith("/index.html") ? 200 : 404,
        });
      },
    },
  };
}

describe("Cloudflare Worker fetch adapter", () => {
  it("serves the public tRPC auth.me procedure without a Node HTTP server", async () => {
    const fetch = createWorkerFetch();
    const response = await fetch(
      new Request("https://bakery.example/api/trpc/auth.me"),
      { HYPERDRIVE: { connectionString: "postgres://worker-test" }, ASSETS: makeAssets().binding },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: { data: { json: null } } });
  });

  it("does not expose the retired Manus OAuth callback route", async () => {
    const fetch = createWorkerFetch();
    const response = await fetch(
      new Request("https://bakery.example/api/oauth/callback"),
      { ASSETS: makeAssets().binding },
    );
    expect(response.status).toBe(404);
  });

  it("routes storage requests through the fetch-native storage proxy", async () => {
    const fetch = createWorkerFetch();
    const response = await fetch(
      new Request("https://bakery.example/manus-storage/report.xlsx"),
      { ASSETS: makeAssets().binding },
    );
    expect([307, 500, 502]).toContain(response.status);
  });

  it("serves index.html for an HTML client-side ERP deep link after an asset miss", async () => {
    const assets = makeAssets();
    const fetch = createWorkerFetch();
    const response = await fetch(
      new Request("https://bakery.example/production", { headers: { Accept: "text/html" } }),
      { ASSETS: assets.binding },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("index");
    expect(assets.requests).toEqual(["/production", "/index.html"]);
  });

  it("does not rewrite JSON asset misses", async () => {
    const assets = makeAssets();
    const fetch = createWorkerFetch();
    const response = await fetch(
      new Request("https://bakery.example/data.json", { headers: { Accept: "application/json" } }),
      { ASSETS: assets.binding },
    );
    expect(response.status).toBe(404);
    expect(assets.requests).toEqual(["/data.json"]);
  });
});

export {};
