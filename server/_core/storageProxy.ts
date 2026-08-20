import type { Express } from "express";
import { ENV } from "./env";

export async function handleStorageProxyRequest(request: Request): Promise<Response> {
  const key = new URL(request.url).pathname.replace(/^\/manus-storage\//, "");
  if (!key) return new Response("Missing storage key", { status: 400 });
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return new Response("Storage proxy not configured", { status: 500 });

  try {
    const forgeUrl = new URL(
      "v1/storage/presign/get",
      ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
    );
    forgeUrl.searchParams.set("path", key);

    const forgeResp = await fetch(forgeUrl, {
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
    });

    if (!forgeResp.ok) {
      const body = await forgeResp.text().catch(() => "");
      console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
      return new Response("Storage backend error", { status: 502 });
    }

    const { url } = (await forgeResp.json()) as { url: string };
    if (!url) return new Response("Empty signed URL from backend", { status: 502 });
    return Response.redirect(url, 307);
  } catch (err) {
    console.error("[StorageProxy] failed:", err);
    return new Response("Storage proxy error", { status: 502 });
  }
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const response = await handleStorageProxyRequest(new Request(`${req.protocol}://${req.get("host")}${req.originalUrl}`));
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.status(response.status).send(await response.text());
  });
}
