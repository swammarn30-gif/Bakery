import { describe, expect, it } from "vitest";
import { createWorkerFetch } from "../worker-handler";

function makeAssets() {
  const requests: string[] = [];
  return {
    requests,
    binding: {
      fetch: async (request: Request) => {
        requests.push(new URL(request.url).pathname);
        return new Response(request.url.endsWith("/index.html") ? "index" : "missing", { status: request.url.endsWith("/index.html") ? 200 : 404 });
      },
    },
  };
}

describe("Cloudflare Worker fetch adapter", () => {
  it.each(["/api/trpc/items.list", "/api/oauth/callback", "/manus-storage/report.xlsx"])("forwards %s to the shared Express server", async path => {
    const calls: Array<{ port: number; path: string }> = [];
    const fetch = createWorkerFetch(async (port, request) => {
      calls.push({ port, path: new URL(request.url).pathname });
      return new Response("server", { status: 200 });
    });
    const response = await fetch(new Request(`https://bakery.example${path}`), { HYPERDRIVE: { connectionString: "postgres://worker-test" }, ASSETS: makeAssets().binding });
    expect(response.status).toBe(200);
    expect(calls).toEqual([{ port: 8080, path }]);
  });

  it("serves index.html for an HTML client-side ERP deep link after an asset miss", async () => {
    const assets = makeAssets();
    const fetch = createWorkerFetch(async () => new Response("server", { status: 200 }));
    const response = await fetch(new Request("https://bakery.example/production", { headers: { Accept: "text/html" } }), { ASSETS: assets.binding });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("index");
    expect(assets.requests).toEqual(["/production", "/index.html"]);
  });

  it("does not rewrite JSON asset misses", async () => {
    const assets = makeAssets();
    const fetch = createWorkerFetch(async () => new Response("server", { status: 200 }));
    const response = await fetch(new Request("https://bakery.example/data.json", { headers: { Accept: "application/json" } }), { ASSETS: assets.binding });
    expect(response.status).toBe(404);
    expect(assets.requests).toEqual(["/data.json"]);
  });
});

export {};
